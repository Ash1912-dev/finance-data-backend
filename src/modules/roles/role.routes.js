const { Router } = require('express');
const ctrl = require('./role.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const { PERMISSIONS } = require('../../config/constants');

const router = Router();
router.use(authenticate, authorize(PERMISSIONS.MANAGE_ROLES));

router.get('/', ctrl.getAllRoles);
router.post('/', ctrl.createRole);
router.patch('/:id', ctrl.updateRole);
router.delete('/:id', ctrl.deleteRole);

module.exports = router;
