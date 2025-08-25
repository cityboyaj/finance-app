const Budget = require('../models/Budget');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const { Op } = require('sequelize');

// Get all budgets for current month
async function getBudgets(req, res) {
  try {
    const now = new Date();
    const month = req.query.month || now.getMonth() + 1;
    const year = req.query.year || now.getFullYear();

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
}

// Create or update a budget
async function setBudget(req, res) {
  const { CategoryId, budgetAmount, month, year } = req.body;
  
  try {
    // Check if category exists
    const category = await Category.findByPk(CategoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category does not exist'
      });
    }

    // Calculate current spent amount for this period
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const spentAmount = await Transaction.sum('amount', {
      where: {
        UserId: req.user.id,
        CategoryId: CategoryId,
        type: 'expense',
        date: {
          [Op.between]: [startDate, endDate]
        }
      }
    }) || 0;

    // Find or create budget
    const [budget, created] = await Budget.findOrCreate({
      where: {
        UserId: req.user.id,
        CategoryId: CategoryId,
        month: month,
        year: year
      },
      defaults: {
        budgetAmount: budgetAmount,
        spentAmount: spentAmount
      }
    });

    // If budget exists, update it
    if (!created) {
      budget.budgetAmount = budgetAmount;
      budget.spentAmount = spentAmount;
      await budget.save();
    }

    const budgetWithCategory = await Budget.findByPk(budget.id, {
      include: [Category]
    });

    res.json({
      success: true,
      message: created ? 'Budget created successfully!' : 'Budget updated successfully!',
      budget: budgetWithCategory
    });
  } catch (err) {
    console.error('Set budget error:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({
        success: false,
        message: 'Budget for this category and period already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Could not set budget. Please try again.'
      });
    }
  }
}

// Get budget overview with spending analysis
async function getBudgetOverview(req, res) {
  try {
    const now = new Date();
    const month = req.query.month || now.getMonth() + 1;
    const year = req.query.year || now.getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Get all budgets for the period
    const budgets = await Budget.findAll({
      where: { 
        UserId: req.user.id,
        month: month,
        year: year
      },
      include: [Category]
    });

    // Calculate totals
    const totalBudget = budgets.reduce((sum, b) => sum + b.budgetAmount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
    const remainingBudget = totalBudget - totalSpent;

    // Find over-budget categories
    const overBudgetCategories = budgets.filter(b => b.spentAmount > b.budgetAmount);
    
    // Find categories close to budget (80% or more)
    const closeToLimitCategories = budgets.filter(b => 
      b.spentAmount >= (b.budgetAmount * 0.8) && b.spentAmount <= b.budgetAmount
    );

    // Calculate spending by day for the month
    const dailySpending = await Transaction.findAll({
      where: {
        UserId: req.user.id,
        type: 'expense',
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('date')), 'date'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'amount']
      ],
      group: [sequelize.fn('DATE', sequelize.col('date'))],
      order: [[sequelize.fn('DATE', sequelize.col('date')), 'ASC']],
      raw: true
    });

    res.json({
      success: true,
      overview: {
        period: { month, year },
        totalBudget,
        totalSpent,
        remainingBudget,
        budgetUsedPercentage: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
        categoriesCount: budgets.length,
        overBudgetCount: overBudgetCategories.length,
        closeToLimitCount: closeToLimitCategories.length
      },
      budgets: budgets.map(budget => ({
        ...budget.toJSON(),
        remainingAmount: budget.budgetAmount - budget.spentAmount,
        percentageUsed: budget.budgetAmount > 0 ? Math.round((budget.spentAmount / budget.budgetAmount) * 100) : 0,
        status: budget.spentAmount > budget.budgetAmount ? 'over' : 
                budget.spentAmount >= (budget.budgetAmount * 0.8) ? 'warning' : 'good'
      })),
      alerts: {
        overBudget: overBudgetCategories.map(b => b.Category.name),
        closeToLimit: closeToLimitCategories.map(b => b.Category.name)
      },
      dailySpending
    });
  } catch (err) {
    console.error('Get budget overview error:', err);
    res.status(500).json({
      success: false,
      message: 'Could not get budget overview. Please try again.'
    });
  }
}

// Delete a budget
async function deleteBudget(req, res) {
  const { id } = req.params;
  
  try {
    const budget = await Budget.findOne({
      where: { 
        id: id,
        UserId: req.user.id
      }
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    await budget.destroy();
    res.json({ 
      success: true, 
      message: 'Budget deleted successfully!' 
    });
  } catch (err) {
    console.error('Delete budget error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Could not delete budget. Please try again.'
    });
  }
}

module.exports = { 
  getBudgets, 
  setBudget, 
  getBudgetOverview, 
  deleteBudget 
};
