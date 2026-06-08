require('dotenv').config();
const mysql = require('mysql2/promise');

async function debug() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'monika_opticals',
  });
  
  const [rows] = await pool.query('SELECT id, name, category, image FROM products');
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

debug();
