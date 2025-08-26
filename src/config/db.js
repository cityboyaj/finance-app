const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

// Try individual variables first (more reliable for Railway)
if (process.env.MYSQLHOST && process.env.MYSQLDATABASE) {
  console.log('🔗 Using individual MySQL variables');
  console.log('🔗 Connecting to:', process.env.MYSQLHOST + ':' + process.env.MYSQLPORT + '/' + process.env.MYSQLDATABASE);
  
  sequelize = new Sequelize(process.env.MYSQLDATABASE, process.env.MYSQLUSER, process.env.MYSQLPASSWORD, {
    host: process.env.MYSQLHOST,
    port: parseInt(process.env.MYSQLPORT) || 3306,
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
    },
    retry: {
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /ESOCKETTIMEDOUT/,
        /EHOSTUNREACH/,
        /EPIPE/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ],
      max: 3
    }
  });
} else if (process.env.MYSQL_URL) {
  console.log('🔗 Using MYSQL_URL for connection');
  console.log('🔗 MYSQL_URL preview:', process.env.MYSQL_URL.substring(0, 40) + '...');
  
  // Parse the URL manually to ensure proper database selection
  const url = new URL(process.env.MYSQL_URL);
  const dbName = url.pathname.slice(1); // Remove the leading slash
  
  console.log('🔗 Extracted database name:', dbName);
  
  sequelize = new Sequelize(dbName, url.username, url.password, {
    host: url.hostname,
    port: parseInt(url.port) || 3306,
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
    },
    retry: {
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /ESOCKETTIMEDOUT/,
        /EHOSTUNREACH/,
        /EPIPE/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ],
      max: 3
    }
  });
} else if (process.env.MYSQLHOST && process.env.MYSQLDATABASE) {
  // Use individual variables as fallback
  console.log('🔗 Using individual MySQL variables');
  console.log('🔗 Connecting to:', process.env.MYSQLHOST + ':' + process.env.MYSQLPORT + '/' + process.env.MYSQLDATABASE);
  
  sequelize = new Sequelize(process.env.MYSQLDATABASE, process.env.MYSQLUSER, process.env.MYSQLPASSWORD, {
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT || 3306,
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

  if (!dbConfig.database || !dbConfig.username || !dbConfig.host) {
    throw new Error('Missing required database configuration. Please check your environment variables.');
  }

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