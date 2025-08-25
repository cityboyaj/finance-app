const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation for creating categories
const validateCategory = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category name must be between 1 and 50 characters'),
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be either income or expense'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex code (e.g., #FF0000)'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category data',
        errors: errors.array()
      });
    }
    next();
  }
];

// Get all categories
router.get('/', authenticateToken, async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['type', 'ASC'], ['name', 'ASC']]
    });
    res.json({
      success: true,
      categories
    });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({
      success: false,
      message: 'Could not get categories. Please try again.'
    });
  }
});

// Create new category
router.post('/', authenticateToken, validateCategory, async (req, res) => {
  const { name, type, icon, color } = req.body;
  try {
    const category = await Category.create({
      name,
      type,
      icon: icon || '💰',
      color: color || '#6B7280',
      isDefault: false
    });
    res.status(201).json({
      success: true,
      message: 'Category created successfully!',
      category
    });
  } catch (err) {
    console.error('Create category error:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({
        success: false,
        message: 'A category with this name already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Could not create category. Please try again.'
      });
    }
  }
});

module.exports = router;
