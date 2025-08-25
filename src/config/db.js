const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('financeapp', 'finance', 'Ajay2008!', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;
