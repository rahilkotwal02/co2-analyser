const express = require("express");
const router = express.Router();
const db = require("../db");  // ✅ Correct relative path

// ✅ UPDATED: Route to Save CO₂ Estimate with user_id & temperature
router.post("/store-estimate", (req, res) => {
  const { energy, energy_unit, co2e, co2e_unit, activity_type, user_id } = req.body;

  console.log("📥 Received CO2 estimate to store:", req.body);

  if (!energy || !co2e) {
    console.warn("⚠️ Missing required fields:", req.body);
    return res.status(400).json({ error: "Missing required fields energy or co2e" });
  }

  // Dummy temperature for filter testing (random between 24–29)
  const temperature = 24 + Math.floor(Math.random() * 6);

  const sql = `INSERT INTO co2_estimates 
    (energy, energy_unit, co2e, co2e_unit, activity_type, temperature, user_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  console.log("Executing SQL with params:", [energy, energy_unit, co2e, co2e_unit, activity_type || 'electricity', temperature, user_id]);

  db.query(
    sql,
    [energy, energy_unit, co2e, co2e_unit, activity_type || 'electricity', temperature, user_id],
    (err, result) => {
      if (err) {
        console.error("❌ Database Insert Error:", err);
        return res.status(500).json({ error: "Database insert failed", details: err.message });
      }
      console.log("✅ CO₂ Estimate saved with ID:", result.insertId);
      res.json({ message: "CO₂ estimate saved successfully!", id: result.insertId });
    }
  );
});

// Route to Get All Saved CO₂ Estimates
router.get("/estimates", (req, res) => {
  console.log("📥 Fetching all CO₂ estimates");
  
  db.query("SELECT * FROM co2_estimates ORDER BY created_at DESC", (err, results) => {
    if (err) {
      console.error("❌ Database Fetch Error:", err);
      return res.status(500).json({ error: "Database fetch failed", details: err.message });
    }
    
    console.log(`✅ Retrieved ${results.length} CO₂ records`);
    res.json(results);
  });
});

// NEW: Add a route for CO₂ calculation
router.post("/calculate", (req, res) => {
  const { energy, energy_unit, activity_type } = req.body;

  console.log("📥 Received CO₂ Calculation Request:", req.body);

  if (!energy || !energy_unit || !activity_type) {
    console.warn("⚠️ Missing parameters:", req.body);
    return res.status(400).json({ error: "Missing required fields: energy, energy_unit, activity_type" });
  }

  const emissionFactor = activity_type === "electricity" ? 0.5 : activity_type === "car" ? 0.3 : 0.2;
  const co2e = energy * emissionFactor;

  console.log(`✅ Calculated CO₂ Emission: ${co2e} kg`);
  res.json({ co2e, co2e_unit: "kg" });
});

// NEW: Add a data endpoint that matches what your frontend is calling
router.get("/data", (req, res) => {
  console.log("📥 Fetching CO₂ data");
  
  db.query("SELECT * FROM co2_estimates ORDER BY created_at DESC", (err, results) => {
    if (err) {
      console.error("❌ Database Fetch Error:", err);
      return res.status(500).json({ error: "Database fetch failed", details: err.message });
    }
    
    console.log(`✅ Retrieved ${results.length} CO₂ data records`);
    res.json(results);
  });
});

// NEW: Add a route to get the latest estimate
router.get("/latest", (req, res) => {
  console.log("📥 Fetching latest CO₂ estimate");
  
  db.query("SELECT * FROM co2_estimates ORDER BY created_at DESC LIMIT 1", (err, results) => {
    if (err) {
      console.error("❌ Database Fetch Error:", err);
      return res.status(500).json({ error: "Database fetch failed", details: err.message });
    }
    
    console.log("✅ Retrieved latest CO₂ record:", results.length > 0 ? results[0].id : "none");
    res.json(results.length > 0 ? results[0] : null);
  });
});

// NEW: Add filtered estimates endpoint
router.get("/estimates/filter", (req, res) => {
  const { 
    location, 
    minEmission, 
    maxEmission, 
    minTemp, 
    maxTemp, 
    startDate, 
    endDate,
    activityType 
  } = req.query;
  
  console.log("📥 Filtering CO₂ estimates with criteria:", req.query);
  
  let sql = "SELECT e.*, u.location_id FROM co2_estimates e LEFT JOIN users u ON e.user_id = u.id WHERE 1=1";
  const params = [];
  
  if (location) {
    sql += " AND u.location_id = ?";
    params.push(location);
  }
  
  if (minEmission) {
    sql += " AND e.co2e >= ?";
    params.push(parseFloat(minEmission));
  }
  
  if (maxEmission) {
    sql += " AND e.co2e <= ?";
    params.push(parseFloat(maxEmission));
  }
  
  if (minTemp) {
    sql += " AND e.temperature >= ?";
    params.push(parseFloat(minTemp));
  }
  
  if (maxTemp) {
    sql += " AND e.temperature <= ?";
    params.push(parseFloat(maxTemp));
  }
  
  if (startDate) {
    sql += " AND e.created_at >= ?";
    params.push(startDate);
  }
  
  if (endDate) {
    sql += " AND e.created_at <= ?";
    params.push(endDate);
  }
  
  if (activityType) {
    sql += " AND e.activity_type = ?";
    params.push(activityType);
  }
  
  sql += " ORDER BY e.created_at DESC";
  
  console.log("Executing query:", sql, "with params:", params);
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("❌ Database Filter Error:", err);
      return res.status(500).json({ error: "Database filter failed", details: err.message });
    }
    
    console.log(`✅ Retrieved ${results.length} filtered CO₂ records`);
    res.json(results);
  });
});

module.exports = router;