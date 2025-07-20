const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mysql = require("../db");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your_refresh_secret_key";

// ✅ TEMPORARY SIMPLIFIED USER REGISTRATION (No location lookup)
router.post("/register", async (req, res) => {
  const { name, email, password, mobile, location, age, role } = req.body;

  if (!name || !email || !password || !mobile || !age || !role) {
    console.warn("⚠️ Missing required fields:", req.body);
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    // TEMP: Use a known valid location_id (New Delhi = 1)
    const location_id = 1;
    const sql = `INSERT INTO users 
      (name, email, password, mobile, location_id, age, role) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
    mysql.query(sql, [name, email, hashedPassword, mobile, location_id, age, role], (err, result) => {
      if (err) {
        console.error("❌ Database Insert Error:", err);
        return res.status(500).json({ error: "User already exists or database error." });
      }
      console.log("✅ User Registered:", email);
      res.json({ message: "User registered successfully!" });
    });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ User Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }
  const sql = "SELECT * FROM users WHERE email = ?";
  mysql.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("❌ Database Query Error:", err);
      return res.status(500).json({ error: "Database error. Please try again." });
    }
    if (results.length === 0) {
      console.warn("⚠️ User not found:", email);
      return res.status(400).json({ error: "User not found. Please register first." });
    }
    const user = results[0];
    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.warn("⚠️ Invalid password attempt for:", email);
        return res.status(400).json({ error: "Invalid password." });
      }
      // Generate Access and Refresh Tokens
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      const refreshToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
      );
      // Save refresh token in an HttpOnly cookie
      res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
      console.log("✅ Login Successful for:", email);
      res.json({
        message: "Login successful",
        accessToken,
        role: user.role,
        user_id: user.id
      });
    } catch (error) {
      console.error("❌ Password Comparison Error:", error);
      return res.status(500).json({ error: "Server error. Please try again." });
    }
  });
});

// ✅ Refresh Token (to get a new access token)
router.post("/refresh-token", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token found. Please log in again." });
  }
  jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired refresh token." });
    }
    // Generate new access token
    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ accessToken: newAccessToken });
  });
});

// ✅ Get Logged-in User Profile
router.get("/profile", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    console.warn("⚠️ Missing Token in Request Headers");
    return res.status(401).json({ error: "Unauthorized. Token missing." });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("✅ Token Decoded Successfully:", decoded);
    const sql = `
      SELECT u.id, u.name, u.email, u.mobile, u.age, u.role, l.city AS location, u.co2_goal, u.theme
      FROM users u
      LEFT JOIN locations l ON u.location_id = l.id
      WHERE u.id = ?
    `;
    mysql.query(sql, [decoded.id], (err, results) => {
      if (err) {
        console.error("❌ Database Query Error:", err);
        return res.status(500).json({ error: "Database error." });
      }
      if (results.length === 0) {
        console.warn("⚠️ User not found for ID:", decoded.id);
        return res.status(404).json({ error: "User not found." });
      }
      console.log("✅ User Data Retrieved:", results[0]);
      res.json(results[0]);
    });
  } catch (error) {
    console.error("❌ Invalid Token:", error.message);
    return res.status(401).json({ error: "Invalid token." });
  }
});


// ==============================
// Save CO₂ Goal
// ==============================
router.post("/save-goal", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized. Token missing." });

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: "Invalid token." });
  }

  const { goal } = req.body;
  if (typeof goal === "undefined") {
    return res.status(400).json({ error: "Goal is required." });
  }

  const sql = "UPDATE users SET co2_goal = ? WHERE id = ?";
  mysql.query(sql, [goal, decoded.id], (err) => {
    if (err) {
      console.error("❌ Error saving CO₂ goal:", err);
      return res.status(500).json({ error: "Failed to save CO₂ goal" });
    }
    res.status(200).json({ success: true, goal });
  });
});

// ==============================
// Save Theme Preference
// ==============================
router.post("/save-theme", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized. Token missing." });

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: "Invalid token." });
  }

  const { theme } = req.body;
  if (!theme) {
    return res.status(400).json({ error: "Theme is required." });
  }

  const sql = "UPDATE users SET theme = ? WHERE id = ?";
  mysql.query(sql, [theme, decoded.id], (err) => {
    if (err) {
      console.error("❌ Error saving theme preference:", err);
      return res.status(500).json({ error: "Failed to save theme preference" });
    }
    res.status(200).json({ success: true, theme });
  });
});

module.exports = router;
