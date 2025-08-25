/* const express = require('express');

const router = express.Router();
const Transaction = require('Transactions');
const { authenticateToken } = require('../middleware/auth');
const { validateTransaction } = require('../middleware/validation');
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Category = require('./Category');

// Add a new transaction (must be logged in)
router.post('/', authenticateToken, validateTransaction, async (req, res) => {
  const { amount, description, type } = req.body;
  
  try {
    const transaction = await Transaction.create({
      UserId: req.user.id,
      amount,
      description,
      type,
    });
    
    res.status(201).json({
      success: true,
      message: 'Transaction added successfully!',
      transaction
    });
  } catch (err) {
    console.error('Transaction creation error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Could not add transaction. Please try again.'
    });
  }
});

// Get all your transactions (must be logged in)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { UserId: req.user.id },
      order: [['date', 'DESC']]
    });
    
    res.json({
      success: true,
      transactions
    });
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Could not get transactions. Please try again.'
    });
  }
});

// Delete a transaction (must be logged in)
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const transaction = await Transaction.findOne({
      where: { 
        id: id,
        UserId: req.user.id
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await transaction.destroy();
    res.json({ 
      success: true, 
      message: 'Transaction deleted successfully!' 
    });
  } catch (err) {
    console.error('Delete transaction error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Could not delete transaction. Please try again.'
    });
  }
});

module.exports = router;*/

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Category = require('./Category');

const Transaction = sequelize.define('Transaction', {
  amount: { 
    type: DataTypes.FLOAT, 
    allowNull: false,
    validate: { min: 0.01 }
  },
  description: { 
    type: DataTypes.STRING, 
    allowNull: false,
    validate: { len: [1, 255] }
  },
  type: { 
    type: DataTypes.ENUM('income', 'expense'), 
    allowNull: false 
  },
  date: { 
    type: DataTypes.DATE, 
    allowNull: false,
    defaultValue: DataTypes.NOW 
  },
  status: {
    type: DataTypes.ENUM('completed', 'planned'),
    defaultValue: 'completed'
  }
}, {
  indexes: [
    {
      fields: ['UserId', 'date']
    },
    {
      fields: ['UserId', 'CategoryId', 'type']
    },
    {
      fields: ['date']
    }
  ]
});

// Create relationships
Transaction.belongsTo(User);
User.hasMany(Transaction);

Transaction.belongsTo(Category, { allowNull: true });
Category.hasMany(Transaction);

module.exports = Transaction;