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

const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const { authenticateToken } = require('../middleware/auth');
const { validateTransaction } = require('../middleware/validation');
const { updateBudgetSpending } = require('../utils/budgetUtils');

// Add a new transaction (with budget update)
router.post('/', authenticateToken, validateTransaction, async (req, res) => {
  const { amount, description, type, CategoryId } = req.body;
  
  try {
    // If CategoryId is provided, check if it exists
    if (CategoryId) {
      const category = await Category.findByPk(CategoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Selected category does not exist'
        });
      }
    }

    const transaction = await Transaction.create({
      UserId: req.user.id,
      amount,
      description,
      type,
      CategoryId: CategoryId || null
    });
    
    // Update budget spending if this is an expense with a category
    if (type === 'expense' && CategoryId) {
      const transactionDate = new Date(transaction.date);
      await updateBudgetSpending(
        req.user.id, 
        CategoryId, 
        transactionDate.getMonth() + 1, 
        transactionDate.getFullYear()
      );
    }
    
    // Get the transaction with category info
    const transactionWithCategory = await Transaction.findByPk(transaction.id, {
      include: [Category]
    });
    
    res.status(201).json({
      success: true,
      message: 'Transaction added successfully!',
      transaction: transactionWithCategory
    });
  } catch (err) {
    console.error('Transaction creation error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Could not add transaction. Please try again.'
    });
  }
});

// Get all your transactions (with category info)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { UserId: req.user.id },
      include: [Category],
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

// Delete a transaction (with budget update)
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

    const { type, CategoryId, date } = transaction;
    
    await transaction.destroy();
    
    // Update budget spending if this was an expense with a category
    if (type === 'expense' && CategoryId) {
      const transactionDate = new Date(date);
      await updateBudgetSpending(
        req.user.id, 
        CategoryId, 
        transactionDate.getMonth() + 1, 
        transactionDate.getFullYear()
      );
    }
    
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

module.exports = router;
