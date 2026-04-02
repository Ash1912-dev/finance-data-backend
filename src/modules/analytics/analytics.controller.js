const analyticsService = require('./analytics.service');
const { sendSuccess } = require('../../utils/ApiResponse');

const getSummary = async (req, res, next) => {
  try {
    const summary = await analyticsService.getSummary();
    return sendSuccess(res, summary, 'Summary retrieved');
  } catch (err) { next(err); }
};

const getByCategory = async (req, res, next) => {
  try {
    const data = await analyticsService.getByCategory(req.query.type);
    return sendSuccess(res, data, 'Category data retrieved');
  } catch (err) { next(err); }
};

const getMonthlyTrends = async (req, res, next) => {
  try {
    const trends = await analyticsService.getMonthlyTrends(req.query.year);
    return sendSuccess(res, trends, 'Trends retrieved');
  } catch (err) { next(err); }
};

const getBudgetStatus = async (req, res, next) => {
  try {
    const status = await analyticsService.getBudgetStatus();
    return sendSuccess(res, status, 'Budget status retrieved');
  } catch (err) { next(err); }
};

const getInsights = async (req, res, next) => {
  try {
    const insights = await analyticsService.getInsights();
    return sendSuccess(res, insights, 'Insights retrieved');
  } catch (err) { next(err); }
};

const getHealthScore = async (req, res, next) => {
  try {
    const score = await analyticsService.getHealthScore();
    return sendSuccess(res, score, 'Health score retrieved');
  } catch (err) { next(err); }
};

module.exports = { getSummary, getByCategory, getMonthlyTrends, getBudgetStatus, getInsights, getHealthScore };
