const jwt = require('jsonwebtoken');
const User = require('../modules/users/user.model');
const ApiError = require('../utils/ApiError');
const { JWT_SECRET } = require('../config/env');
const { USER_STATUS } = require('../config/constants');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new ApiError(401, 'No token provided', 'NO_TOKEN');

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId)
      .select('-passwordHash')
      .populate('role', 'name slug permissions')
      .lean();

    if (!user) throw new ApiError(401, 'User not found', 'USER_NOT_FOUND');
    if (user.status !== USER_STATUS.ACTIVE) throw new ApiError(401, 'Account is inactive', 'ACCOUNT_INACTIVE');

    req.user = { _id: user._id, name: user.name, email: user.email, role: user.role };
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authenticate;
