const Joi = require('joi');

const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'inactive').required(),
});

const updateRoleSchema = Joi.object({
  roleId: Joi.string().hex().length(24).required(),
});

module.exports = { updateUserSchema, updateStatusSchema, updateRoleSchema };
