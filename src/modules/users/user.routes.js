const { Router } = require('express');
const ctrl = require('./user.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const { PERMISSIONS } = require('../../config/constants');
const { updateUserSchema, updateStatusSchema, updateRoleSchema } = require('../../validators/user.validator');

const router = Router();
router.use(authenticate, authorize(PERMISSIONS.MANAGE_USERS));

router.get('/', ctrl.getUsers);
router.get('/:id', ctrl.getUserById);
router.patch('/:id', validate(updateUserSchema), ctrl.updateUser);
router.patch('/:id/status', validate(updateStatusSchema), ctrl.updateUserStatus);
router.patch('/:id/role', validate(updateRoleSchema), ctrl.updateUserRole);
router.delete('/:id', ctrl.deleteUser);

module.exports = router;
