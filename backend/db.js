// Update your backend/config/db.js to ensure proper exports

const mysql = require('mysql2');
require('dotenv').config();

// Create connection pool for better performance
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'co2_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Log connection status
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection error:', err);
    return;
  }
  console.log('✅ Connected to database: ' + process.env.DB_NAME);
  connection.release();
});

// Export the pool for query execution
module.exports = pool;