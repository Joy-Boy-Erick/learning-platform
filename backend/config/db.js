import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create a connection pool. This is more efficient than creating a new connection
// for every query, as it reuses existing connections.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// You can export the pool and use it in your route files to query the database.
// Example usage:
// import pool from './config/db.js';
// const [rows] = await pool.query('SELECT * FROM users');

export default pool;
