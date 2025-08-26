// src/config/db.js - UPDATED VERSION
const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

// Check if we have a DATABASE_URL (Railway provides this automatically)
if (process.env.DATABASE_URL) {
  console.log('🔗 Using DATABASE_URL for connection');
  
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    // Remove the invalid dialectOptions for MySQL2
    dialectOptions: {
      connectTimeout: 60000,
      // Remove acquireTimeout and timeout - these are not valid for MySQL2
    }
  });
} else {
  // Fallback to individual environment variables
  console.log('🔗 Using individual environment variables');
  
  const dbConfig = {
    database: process.env.MYSQLDATABASE,
    username: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT || 3306,
  };
  
  console.log('Database config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    username: dbConfig.username ? '***' : 'MISSING'
  });

  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      connectTimeout: 60000,
    }
  });
}

module.exports = sequelize;