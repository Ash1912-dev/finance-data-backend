const { Router } = require('express');
const ctrl = require('./audit.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const { PERMISSIONS } = require('../../config/constants');

const router = Router();
router.use(authenticate, authorize(PERMISSIONS.READ_AUDIT));

router.get('/', ctrl.getAuditLogs);
router.get('/user/:userId', ctrl.getUserAuditTrail);

module.exports = router;
