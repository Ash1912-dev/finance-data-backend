const Role = require('./role.model');
const ApiError = require('../../utils/ApiError');

const getAllRoles = async () => {
  return Role.find().sort({ name: 1 }).lean();
};

const getRoleById = async (roleId) => {
  const role = await Role.findById(roleId).lean();
  if (!role) throw new ApiError(404, 'Role not found', 'ROLE_NOT_FOUND');
  return role;
};

const createRole = async ({ name, permissions, description }) => {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const existing = await Role.findOne({ slug }).lean();
  if (existing) throw new ApiError(409, 'A role with this name already exists', 'DUPLICATE_ROLE');

  const role = await Role.create({ name, slug, permissions: permissions || [], description: description || '', isSystem: false });
  return role.toObject();
};

const updateRole = async (roleId, updates) => {
  const role = await Role.findById(roleId);
  if (!role) throw new ApiError(404, 'Role not found', 'ROLE_NOT_FOUND');

  if (updates.permissions !== undefined) role.permissions = updates.permissions;
  if (updates.description !== undefined) role.description = updates.description;
  if (updates.name !== undefined) role.name = updates.name;

  await role.save();
  return role.toObject();
};

const deleteRole = async (roleId) => {
  const role = await Role.findById(roleId);
  if (!role) throw new ApiError(404, 'Role not found', 'ROLE_NOT_FOUND');
  if (role.isSystem) throw new ApiError(403, 'System roles cannot be deleted', 'SYSTEM_ROLE');

  await Role.deleteOne({ _id: roleId });
  return role.toObject();
};

module.exports = { getAllRoles, getRoleById, createRole, updateRole, deleteRole };
