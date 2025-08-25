const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Import routes
const authRoutes = require('./src/routes/auth');
const transactionRoutes = require('./src/routes/transactions');
const categoryRoutes = require('./src/routes/categories');
const budgetRoutes = require('./src/routes/budgets');

// Mount routes
app.use('/api', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);

// Function to create default categories
async function seedDefaultCategories() {
  const Category = require('./src/models/Category');
  
  const defaultCategories = [
    // Income categories
    { name: 'Salary', type: 'income', icon: '💼', color: '#10B981' },
    { name: 'Freelance', type: 'income', icon: '💻', color: '#059669' },
    { name: 'Investment', type: 'income', icon: '📈', color: '#047857' },
    { name: 'Gift', type: 'income', icon: '🎁', color: '#065F46' },
    
    // Expense categories
    { name: 'Food & Dining', type: 'expense', icon: '🍽️', color: '#EF4444' },
    { name: 'Transportation', type: 'expense', icon: '🚗', color: '#F97316' },
    { name: 'Shopping', type: 'expense', icon: '🛍️', color: '#F59E0B' },
    { name: 'Entertainment', type: 'expense', icon: '🎬', color: '#8B5CF6' },
    { name: 'Bills & Utilities', type: 'expense', icon: '💡', color: '#6366F1' },
    { name: 'Healthcare', type: 'expense', icon: '⚕️', color: '#EC4899' },
    { name: 'Education', type: 'expense', icon: '📚', color: '#3B82F6' },
    { name: 'Travel', type: 'expense', icon: '✈️', color: '#06B6D4' },
    { name: 'Other', type: 'expense', icon: '💰', color: '#6B7280' }
  ];

  try {
    for (const category of defaultCategories) {
      await Category.findOrCreate({
        where: { name: category.name },
        defaults: category
      });
    }
    console.log('Default categories created/verified!');
  } catch (error) {
    console.error('Error creating default categories:', error);
  }
}

// Test DB connection and start server
sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully!');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('Database models synced!');
    return seedDefaultCategories();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Available endpoints:');
      console.log('  POST /api/register');
      console.log('  POST /api/login');
      console.log('  GET  /api/categories');
      console.log('  POST /api/categories');
      console.log('  GET  /api/transactions');
      console.log('  POST /api/transactions');
      console.log('  DELETE /api/transactions/:id');
      console.log('  GET  /api/budgets');
      console.log('  GET  /api/budgets/overview');
      console.log('  POST /api/budgets');
      console.log('  DELETE /api/budgets/:id');
    });
  })
  .catch(err => {
    console.error('Unable to connect to database:', err);
  });