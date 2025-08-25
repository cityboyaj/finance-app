const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Transaction = sequelize.define('Transaction', {
  amount: { type: DataTypes.FLOAT, allowNull: false },
  description: { type: DataTypes.STRING },
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  type: { type: DataTypes.ENUM('income', 'expense'), allowNull: false },
});

// Associate transactions with users
Transaction.belongsTo(User);
User.hasMany(Transaction);

module.exports = Transaction;
