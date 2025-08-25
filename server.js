const express = require('express');
const sequelize = require('./src/config/db');

const app = express();
const PORT = 3000;

app.use(express.json());

// Import routes
const authRoutes = require('./src/routes/auth');
const transactionRoutes = require('./src/routes/transactions');

// Mount routes
app.use('/api', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Test DB connection and start server
sequelize.authenticate()
  .then(() => {
    console.log('MySQL connected!');
    sequelize.sync({ alter: true }).then(() => console.log('Models synced'));
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('DB connection error:', err));
