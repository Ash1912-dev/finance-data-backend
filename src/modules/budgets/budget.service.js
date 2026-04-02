const Budget = require('./budget.model');
const ApiError = require('../../utils/ApiError');

const getAllBudgets = async () => Budget.find().lean();

const getBudgetById = async (budgetId) => {
  const budget = await Budget.findById(budgetId).lean();
  if (!budget) throw new ApiError(404, 'Budget not found', 'BUDGET_NOT_FOUND');
  return budget;
};

const createBudget = async ({ category, limitAmount, period, alertThreshold, createdBy }) => {
  const existing = await Budget.findOne({ category: category.toLowerCase(), period }).lean();
  if (existing) throw new ApiError(409, `A ${period} budget for "${category}" already exists`, 'DUPLICATE_BUDGET');

  const budget = await Budget.create({ category: category.toLowerCase(), limitAmount, period, alertThreshold, createdBy });
  return budget.toObject();
};

const updateBudget = async (budgetId, updates) => {
  const budget = await Budget.findById(budgetId);
  if (!budget) throw new ApiError(404, 'Budget not found', 'BUDGET_NOT_FOUND');

  if (updates.limitAmount !== undefined) budget.limitAmount = updates.limitAmount;
  if (updates.alertThreshold !== undefined) budget.alertThreshold = updates.alertThreshold;

  await budget.save();
  return budget.toObject();
};

const deleteBudget = async (budgetId) => {
  const budget = await Budget.findByIdAndDelete(budgetId);
  if (!budget) throw new ApiError(404, 'Budget not found', 'BUDGET_NOT_FOUND');
  return budget.toObject();
};

module.exports = { getAllBudgets, getBudgetById, createBudget, updateBudget, deleteBudget };
