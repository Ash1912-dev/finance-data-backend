const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../users/user.model');
const Role = require('../roles/role.model');
const ApiError = require('../../utils/ApiError');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../../config/env');
const { DEFAULT_ROLES } = require('../../config/constants');

const generateToken = (userId) => jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email: email.toLowerCase() }).lean();
  if (existing) throw new ApiError(409, 'Email already registered', 'DUPLICATE_EMAIL');

  const viewerRole = await Role.findOne({ slug: DEFAULT_ROLES.VIEWER }).lean();
  if (!viewerRole) throw new ApiError(500, 'Default role not found — run seed first', 'SEED_REQUIRED');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash, role: viewerRole._id });
  const token = generateToken(user._id);

  const populated = await User.findById(user._id)
    .select('-passwordHash')
    .populate('role', 'name slug permissions')
    .lean();

  return { user: populated, token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).populate('role', 'name slug permissions');
  if (!user) throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  if (user.status !== 'active') throw new ApiError(401, 'Account is inactive', 'ACCOUNT_INACTIVE');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');

  user.lastLoginAt = new Date();
  await user.save();

  return { user: user.toJSON(), token: generateToken(user._id) };
};

const getMe = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash').populate('role', 'name slug permissions').lean();
  if (!user) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  return user;
};

module.exports = { register, login, getMe };
