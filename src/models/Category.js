const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Category = sequelize.define('Category', {
  name: { 
    type: DataTypes.STRING, 
    allowNull: false,
    unique: true 
  },
  type: { 
    type: DataTypes.ENUM('income', 'expense'), 
    allowNull: false 
  },
  icon: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  color: { 
    type: DataTypes.STRING, 
    allowNull: true,
    defaultValue: '#6B7280' 
  },
  isDefault: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
  }
});

module.exports = Category;