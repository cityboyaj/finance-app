const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Add a transaction
router.post('/', async (req, res) => {
  const { userId, amount, description, type } = req.body;
  try {
    const transaction = await Transaction.create({
      UserId: userId,
      amount,
      description,
      type,
    });
    res.status(201).json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List user transactions
router.get('/:userId', async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { UserId: req.params.userId },
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
