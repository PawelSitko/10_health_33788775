require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.HEALTH_HOST || 'localhost',
  user: process.env.HEALTH_USER || 'root',
  password: process.env.HEALTH_PASSWORD || '',
  database: process.env.HEALTH_DATABASE || 'health',
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
  } else {
    console.log('MySQL connection pool created successfully');
    connection.release();
  }
});

module.exports = pool;
