const { Router } = require('express');
const ctrl = require('./auth.controller');
const authenticate = require('../../middleware/authenticate');
const validate = require('../../middleware/validate');
const { registerSchema, loginSchema } = require('../../validators/auth.validator');

const router = Router();

router.post('/register', validate(registerSchema), ctrl.register);
router.post('/login', validate(loginSchema), ctrl.login);
router.get('/me', authenticate, ctrl.getMe);

module.exports = router;
