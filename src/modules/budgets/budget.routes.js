const { Router } = require('express');
const ctrl = require('./budget.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const auditLogger = require('../../middleware/auditLogger');
const { PERMISSIONS, AUDIT_ACTIONS } = require('../../config/constants');
const { createBudgetSchema, updateBudgetSchema } = require('../../validators/budget.validator');

const router = Router();
router.use(authenticate, authorize(PERMISSIONS.MANAGE_BUDGETS));

router.get('/', ctrl.getAllBudgets);
router.get('/:id', ctrl.getBudgetById);
router.post('/', validate(createBudgetSchema), auditLogger(AUDIT_ACTIONS.CREATE_BUDGET, 'Budget'), ctrl.createBudget);
router.patch('/:id', validate(updateBudgetSchema), auditLogger(AUDIT_ACTIONS.UPDATE_BUDGET, 'Budget'), ctrl.updateBudget);
router.delete('/:id', auditLogger(AUDIT_ACTIONS.DELETE_BUDGET, 'Budget'), ctrl.deleteBudget);

module.exports = router;
