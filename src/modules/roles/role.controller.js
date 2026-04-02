const roleService = require('./role.service');
const { sendSuccess } = require('../../utils/ApiResponse');

const getAllRoles = async (req, res, next) => {
  try {
    const roles = await roleService.getAllRoles();
    return sendSuccess(res, { roles }, 'Roles retrieved');
  } catch (err) { next(err); }
};

const createRole = async (req, res, next) => {
  try {
    const { name, permissions, description } = req.body;
    const role = await roleService.createRole({ name, permissions, description });
    return sendSuccess(res, { role }, 'Role created', 201);
  } catch (err) { next(err); }
};

const updateRole = async (req, res, next) => {
  try {
    const role = await roleService.updateRole(req.params.id, req.body);
    return sendSuccess(res, { role }, 'Role updated');
  } catch (err) { next(err); }
};

const deleteRole = async (req, res, next) => {
  try {
    const role = await roleService.deleteRole(req.params.id);
    return sendSuccess(res, { role }, 'Role deleted');
  } catch (err) { next(err); }
};

module.exports = { getAllRoles, createRole, updateRole, deleteRole };
