const Transaction = require("../models/Transaction");

async function addTransaction(req, res) {
  const { amount, description, date, userId } = req.body;
  try {
    const transaction = await Transaction.create({ amount, description, date, UserId: userId });
    res.json({ success: true, transaction });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function getTransactions(req, res) {
  const { userId } = req.body;
  try {
    const transactions = await Transaction.findAll({ where: { UserId: userId } });
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteTransaction(req, res) {
  const { id } = req.params;
  try {
    await Transaction.destroy({ where: { id } });
    res.json({ success: true, message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { addTransaction, getTransactions, deleteTransaction };
