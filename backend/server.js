require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken"); // Add this - it's missing

const app = express();

// ✅ Fix CORS to allow credentials
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"], // Allow all development ports
  credentials: true,
  methods: "GET, POST, PUT, DELETE, OPTIONS",
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization"
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Debugging: Print environment variables to check if .env is loading correctly
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "*****" : "NOT SET"); // Mask password
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PORT:", process.env.DB_PORT);

// Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed ❌:", err);
  } else {
    console.log("Connected to MySQL database ✅");
  }
});

// ✅ Import and use routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// ✅ ADD THIS: Import and use CO2 routes
const co2Routes = require("./routes/co2Routes");
app.use("/api/co2", co2Routes);

// ✅ Define Users API Route
app.get("/api/users/profile", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.warn("⚠️ Missing Token in Request Headers");
    return res.status(401).json({ error: "Unauthorized. Token missing." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token Decoded Successfully:", decoded);

    const sql = `
      SELECT u.id, u.name, u.email, u.mobile, u.age, u.role, l.city AS location
      FROM users u
      LEFT JOIN locations l ON u.location_id = l.id
      WHERE u.id = ?
    `;

    db.query(sql, [decoded.id], (err, results) => {
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

// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});

// Make DB available to other modules (if needed)
module.exports = db;