const express = require('express');
const cors = require('cors');
require('dotenv').config();
// Add this temporarily to your server.js file right after require('dotenv').config();
// This will help us see what environment variables Railway has set

console.log('🔍 DEBUGGING ENVIRONMENT VARIABLES:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL preview:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'NOT SET');

// Check Railway's MySQL variables
console.log('MYSQL variables:');
console.log('- MYSQLHOST:', process.env.MYSQLHOST);
console.log('- MYSQLPORT:', process.env.MYSQLPORT);
console.log('- MYSQLDATABASE:', process.env.MYSQLDATABASE);
console.log('- MYSQLUSER:', process.env.MYSQLUSER);
console.log('- MYSQLPASSWORD exists:', !!process.env.MYSQLPASSWORD);

// List all environment variables that start with 'MYSQL' or 'DATABASE'
console.log('All DB-related environment variables:');
Object.keys(process.env).filter(key => 
  key.includes('MYSQL') || key.includes('DATABASE') || key.includes('DB')
).forEach(key => {
  if (key.includes('PASSWORD') || key.includes('SECRET')) {
    console.log(`${key}: ***`);
  } else {
    console.log(`${key}: ${process.env[key]}`);
  }
});
console.log('🔍 END DEBUG INFO\n');
const sequelize = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

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

// Function to create default categories (same as before)
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
    console.log('✅ Default categories created/verified!');
  } catch (error) {
    console.error('❌ Error creating default categories:', error);
  }
}

// Enhanced database connection with retries
async function connectWithRetry() {
  const maxRetries = 5;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      console.log(`🔄 Attempting database connection (${retries + 1}/${maxRetries})...`);
      
      await sequelize.authenticate();
      console.log('✅ Database connected successfully!');
      
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synced!');
      
      await seedDefaultCategories();
      
      return true;
    } catch (error) {
      console.error(`❌ Database connection attempt ${retries + 1} failed:`, error.message);
      retries++;
      
      if (retries < maxRetries) {
        console.log(`⏳ Retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  
  throw new Error('Failed to connect to database after maximum retries');
}

// Start server with enhanced error handling
connectWithRetry()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log('📊 Available endpoints:');
      console.log('  GET  /health');
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
    console.error('💥 Failed to start server:', err.message);
    process.exit(1);
  });