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
  validate: { 
    min: 2000,
    max: new Date().getFullYear() + 10
  }
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
}, {
  // Define indexes here in the model options
  indexes: [
    {
      unique: true,
      fields: ['UserId', 'CategoryId', 'month', 'year'],
      name: 'unique_user_category_month_year'
    }
  ]
});

// Create relationships
Budget.belongsTo(User);
User.hasMany(Budget);

Budget.belongsTo(Category);
Category.hasMany(Budget);

module.exports = Budget;