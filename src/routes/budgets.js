const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const Category = require('../models/Category');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation for budget creation/update
const validateBudget = [
  body('CategoryId')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a valid number'),
  body('budgetAmount')
    .isFloat({ min: 0.01 })
    .withMessage('Budget amount must be a positive number'),
  body('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  body('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid budget data',
        errors: errors.array()
      });
    }
    next();
  }
];

// Get all budgets for a specific month/year
router.get('/', authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    const budgets = await Budget.findAll({
      where: { 
        UserId: req.user.id,
        month: month,
        year: year
      },
      include: [Category],
      order: [['Category', 'name', 'ASC']]
    });

    res.json({
      success: true,
      budgets,
      period: { month, year }
    });
  } catch (err) {
    console.error('Get budgets error:', err);
    res.status(500).json({
      success: false,
      message: 'Could not get budgets. Please try again.'
    });
  }
});

// Get budget overview with analytics
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const { getBudgetOverview } = require('../controllers/budgetController');
    await getBudgetOverview(req, res);
  } catch (err) {
    console.error('Budget overview error:', err);
    res.status(500).json({
      success: false,
      message: 'Could not get budget overview. Please try again.'
    });
  }
});

// Create or update a budget
router.post('/', authenticateToken, validateBudget, async (req, res) => {
  try {
    const { setBudget } = require('../controllers/budgetController');
    await setBudget(req, res);
  } catch (err) {
    console.error('Set budget error:', err);
    res.status(500).json({
      success: false,
      message: 'Could not set budget. Please try again.'
    });
  }
});

// Delete a budget
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { deleteBudget } = require('../controllers/budgetController');
    await deleteBudget(req, res);
  } catch (err) {
    console.error('Delete budget error:', err);
    res.status(500).json({
      success: false,
      message: 'Could not delete budget. Please try again.'
    });
  }
});

module.exports = router;