const userService = require('./user.service');
const { sendSuccess, sendPaginated } = require('../../utils/ApiResponse');

const getUsers = async (req, res, next) => {
  try {
    const { status, role, page, limit } = req.query;
    const result = await userService.getUsers({ status, role, page, limit });
    return sendPaginated(res, result.data, result.pagination, 'Users retrieved');
  } catch (err) { next(err); }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return sendSuccess(res, { user }, 'User retrieved');
  } catch (err) { next(err); }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, { name: req.body.name });
    return sendSuccess(res, { user }, 'User updated');
  } catch (err) { next(err); }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const user = await userService.updateUserStatus(req.params.id, req.body.status);
    return sendSuccess(res, { user }, 'Status updated');
  } catch (err) { next(err); }
};

const updateUserRole = async (req, res, next) => {
  try {
    const user = await userService.updateUserRole(req.params.id, req.body.roleId);
    return sendSuccess(res, { user }, 'Role updated');
  } catch (err) { next(err); }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await userService.deleteUser(req.params.id);
    return sendSuccess(res, { user }, 'User deactivated');
  } catch (err) { next(err); }
};

module.exports = { getUsers, getUserById, updateUser, updateUserStatus, updateUserRole, deleteUser };
