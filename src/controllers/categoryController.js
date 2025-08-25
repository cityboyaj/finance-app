const Category = require('../models/Category');

// Get all categories
async function getCategories(req, res) {
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
}

// Create a new category
async function createCategory(req, res) {
  const { name, type, icon, color } = req.body;
  try {
    const category = await Category.create({
      name,
      type,
      icon,
      color,
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
}

module.exports = { getCategories, createCategory };