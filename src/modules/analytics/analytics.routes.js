const { Router } = require('express');
const ctrl = require('./analytics.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const { PERMISSIONS } = require('../../config/constants');

const router = Router();
router.use(authenticate, authorize(PERMISSIONS.READ_ANALYTICS));

router.get('/summary', ctrl.getSummary);
router.get('/by-category', ctrl.getByCategory);
router.get('/monthly-trends', ctrl.getMonthlyTrends);
router.get('/budget-status', ctrl.getBudgetStatus);
router.get('/insights', ctrl.getInsights);
router.get('/health', ctrl.getHealthScore); // Added Health Score Endpoint

module.exports = router;
