const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { Op } = require('sequelize');

// Update spent amounts for all budgets when a transaction is added/updated
async function updateBudgetSpending(userId, categoryId, month, year) {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Calculate total spent in this category for this period
    const spentAmount = await Transaction.sum('amount', {
      where: {
        UserId: userId,
        CategoryId: categoryId,
        type: 'expense',
        date: {
          [Op.between]: [startDate, endDate]
        }
      }
    }) || 0;

    // Update the budget if it exists
    await Budget.update(
      { spentAmount: spentAmount },
      {
        where: {
          UserId: userId,
          CategoryId: categoryId,
          month: month,
          year: year
        }
      }
    );

    return spentAmount;
  } catch (error) {
    console.error('Error updating budget spending:', error);
    throw error;
  }
}

// Check if any budgets are exceeded and return alerts
async function checkBudgetAlerts(userId, month, year) {
  try {
    const budgets = await Budget.findAll({
      where: { 
        UserId: userId,
        month: month,
        year: year
      },
      include: [Category]
    });

    const alerts = {
      overBudget: [],
      closeToLimit: []
    };

    budgets.forEach(budget => {
      if (budget.spentAmount > budget.budgetAmount) {
        alerts.overBudget.push({
          category: budget.Category.name,
          budgetAmount: budget.budgetAmount,
          spentAmount: budget.spentAmount,
          overAmount: budget.spentAmount - budget.budgetAmount
        });
      } else if (budget.spentAmount >= (budget.budgetAmount * 0.8)) {
        alerts.closeToLimit.push({
          category: budget.Category.name,
          budgetAmount: budget.budgetAmount,
          spentAmount: budget.spentAmount,
          percentageUsed: Math.round((budget.spentAmount / budget.budgetAmount) * 100)
        });
      }
    });

    return alerts;
  } catch (error) {
    console.error('Error checking budget alerts:', error);
    throw error;
  }
}

module.exports = {
  updateBudgetSpending,
  checkBudgetAlerts
};
