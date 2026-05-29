require('dotenv').config();
const mysql = require('mysql2/promise');

async function initializeDatabase() {
  console.log('🚀 Starting Database Initialization...');

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'monika_opticals'
  };

  try {
    // Connect to MySQL server first to create database if it doesn't exist
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });

    console.log(`📦 Creating database ${dbConfig.database} if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await connection.changeUser({ database: dbConfig.database });

    // Create Products table
    console.log('📦 Creating `products` table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        brand VARCHAR(255),
        price VARCHAR(255),
        category VARCHAR(255),
        features JSON,
        badge VARCHAR(255),
        colors JSON,
        images JSON,
        image VARCHAR(1000),
        visible BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Banners table
    console.log('📦 Creating `banners` table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS banners (
        id VARCHAR(255) PRIMARY KEY,
        src VARCHAR(1000) NOT NULL,
        alt VARCHAR(255),
        visible BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database Initialization Complete!');
    await connection.end();
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
