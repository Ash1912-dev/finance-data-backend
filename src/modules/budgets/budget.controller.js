const budgetService = require('./budget.service');
const { sendSuccess } = require('../../utils/ApiResponse');

const getAllBudgets = async (req, res, next) => {
  try {
    const budgets = await budgetService.getAllBudgets();
    return sendSuccess(res, { budgets }, 'Budgets retrieved');
  } catch (err) { next(err); }
};

const getBudgetById = async (req, res, next) => {
  try {
    const budget = await budgetService.getBudgetById(req.params.id);
    return sendSuccess(res, { budget }, 'Budget retrieved');
  } catch (err) { next(err); }
};

const createBudget = async (req, res, next) => {
  try {
    const budget = await budgetService.createBudget({ ...req.body, createdBy: req.user._id });
    return sendSuccess(res, { budget }, 'Budget created', 201);
  } catch (err) { next(err); }
};

const updateBudget = async (req, res, next) => {
  try {
    const budget = await budgetService.updateBudget(req.params.id, req.body);
    return sendSuccess(res, { budget }, 'Budget updated');
  } catch (err) { next(err); }
};

const deleteBudget = async (req, res, next) => {
  try {
    const budget = await budgetService.deleteBudget(req.params.id);
    return sendSuccess(res, { budget }, 'Budget deleted');
  } catch (err) { next(err); }
};

module.exports = { getAllBudgets, getBudgetById, createBudget, updateBudget, deleteBudget };
