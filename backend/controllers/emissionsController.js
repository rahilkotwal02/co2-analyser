const db = require('../db');

// Get all CO2 estimates for a user
exports.getUserEmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT id, energy, energy_unit, co2e, co2e_unit, activity_type, 
             temperature, created_at
      FROM co2_estimates 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    const [rows] = await db.query(query, [userId]);
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching user emissions:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Add a new CO2 estimate based on energy usage
exports.addEnergyEmission = async (req, res) => {
  try {
    const { energy, energy_unit, activity_type, temperature } = req.body;
    const userId = req.user.id;

    let co2e = parseFloat(energy);
    if (energy_unit === 'kWh') {
      co2e *= 0.4; // Convert kWh to kg CO2
    } else if (energy_unit === 'MWh') {
      co2e *= 400; // Convert MWh to kg CO2
    }

    const query = `
      INSERT INTO co2_estimates (
        energy, energy_unit, co2e, co2e_unit, activity_type, 
        temperature, user_id
      ) VALUES (?, ?, ?, 'kg', ?, ?, ?)
    `;
    const [result] = await db.query(query, [
      energy, 
      energy_unit, 
      co2e, 
      activity_type, 
      temperature, 
      userId
    ]);

    // Return the newly created record with its ID and created_at timestamp
    const [newRecord] = await db.query(
      'SELECT * FROM co2_estimates WHERE id = ?', 
      [result.insertId]
    );
    return res.status(201).json(newRecord[0]);
  } catch (error) {
    console.error('Error adding energy emission:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get CO2 sensor data
exports.getCO2Data = async (req, res) => {
  try {
    const query = `
      SELECT id, timestamp, co2_level, temperature 
      FROM co2_data 
      ORDER BY timestamp DESC 
      LIMIT 100
    `;
    const [rows] = await db.query(query);
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching CO2 data:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Add new CO2 sensor data
exports.addCO2Data = async (req, res) => {
  try {
    const { co2_level, temperature } = req.body;
    const query = `
      INSERT INTO co2_data (timestamp, co2_level, temperature)
      VALUES (NOW(), ?, ?)
    `;
    const [result] = await db.query(query, [co2_level, temperature]);
    // Get the newly created record
    const [newRecord] = await db.query(
      'SELECT * FROM co2_data WHERE id = ?', 
      [result.insertId]
    );
    return res.status(201).json(newRecord[0]);
  } catch (error) {
    console.error('Error adding CO2 data:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get emission statistics with min and breakdown by activity
exports.getEmissionStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Main stats including minimum emission
    const statsQuery = `
      SELECT 
        SUM(co2e) as total_emissions,
        AVG(co2e) as avg_emissions,
        MAX(co2e) as max_emissions,
        MIN(co2e) as min_emissions,
        COUNT(*) as count
      FROM co2_estimates 
      WHERE user_id = ?
    `;
    const [statsRows] = await db.query(statsQuery, [userId]);

    // Breakdown by activity_type
    const breakdownQuery = `
      SELECT activity_type, SUM(co2e) as total
      FROM co2_estimates
      WHERE user_id = ?
      GROUP BY activity_type
    `;
    const [breakdownRows] = await db.query(breakdownQuery, [userId]);

    // Respond with all stats and breakdown
    return res.status(200).json({
      ...statsRows[0],
      breakdown: breakdownRows
    });
  } catch (error) {
    console.error('Error fetching emission stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
