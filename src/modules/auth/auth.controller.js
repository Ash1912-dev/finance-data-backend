const authService = require('./auth.service');
const { sendSuccess } = require('../../utils/ApiResponse');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.register({ name, email, password });
    return sendSuccess(res, result, 'User registered successfully', 201);
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return sendSuccess(res, result, 'Login successful');
  } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user._id);
    return sendSuccess(res, { user }, 'Profile retrieved');
  } catch (err) { next(err); }
};

module.exports = { register, login, getMe };
