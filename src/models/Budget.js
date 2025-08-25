const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Category = require('./Category');

const Budget = sequelize.define('Budget', {
  month: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    validate: { min: 1, max: 12 }
  },
  year: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    validate: { min: 2020, max: 2030 }
  },
  budgetAmount: { 
    type: DataTypes.FLOAT, 
    allowNull: false,
    validate: { min: 0 }
  },
  spentAmount: { 
    type: DataTypes.FLOAT, 
    defaultValue: 0,
    validate: { min: 0 }
  }
});

// Create relationships
Budget.belongsTo(User);
User.hasMany(Budget);

Budget.belongsTo(Category);
Category.hasMany(Budget);

// Add unique constraint for user + category + month + year
Budget.addIndex({
  unique: true,
  fields: ['UserId', 'CategoryId', 'month', 'year'],
  name: 'unique_user_category_month_year'
});

module.exports = Budget;