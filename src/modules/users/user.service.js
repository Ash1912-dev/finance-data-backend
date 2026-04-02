const User = require('./user.model');
const Role = require('../roles/role.model');
const ApiError = require('../../utils/ApiError');
const { paginate } = require('../../utils/pagination');
const { USER_STATUS } = require('../../config/constants');

const getUsers = async ({ status, role, page = 1, limit = 10 }) => {
  const query = {};
  if (status && Object.values(USER_STATUS).includes(status)) query.status = status;
  if (role) query.role = role;

  return paginate(query, User, page, limit,
    [{ path: 'role', select: 'name slug permissions' }],
    { createdAt: -1 }, '-passwordHash'
  );
};

const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash').populate('role', 'name slug permissions').lean();
  if (!user) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  return user;
};

const updateUser = async (userId, { name }) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  user.name = name;
  await user.save();
  return User.findById(userId).select('-passwordHash').populate('role', 'name slug permissions').lean();
};

const updateUserStatus = async (userId, status) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  user.status = status;
  await user.save();
  return User.findById(userId).select('-passwordHash').populate('role', 'name slug permissions').lean();
};

const updateUserRole = async (userId, roleId) => {
  const role = await Role.findById(roleId).lean();
  if (!role) throw new ApiError(404, 'Role not found', 'ROLE_NOT_FOUND');

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  user.role = roleId;
  await user.save();
  return User.findById(userId).select('-passwordHash').populate('role', 'name slug permissions').lean();
};

const deleteUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  user.status = USER_STATUS.INACTIVE;
  await user.save();
  return User.findById(userId).select('-passwordHash').populate('role', 'name slug permissions').lean();
};

module.exports = { getUsers, getUserById, updateUser, updateUserStatus, updateUserRole, deleteUser };
