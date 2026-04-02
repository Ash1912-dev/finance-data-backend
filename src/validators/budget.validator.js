const Joi = require('joi');

const createBudgetSchema = Joi.object({
  category: Joi.string().trim().max(100).required(),
  limitAmount: Joi.number().min(1).required(),
  period: Joi.string().valid('monthly', 'weekly').required(),
  alertThreshold: Joi.number().min(1).max(100),
});

const updateBudgetSchema = Joi.object({
  limitAmount: Joi.number().min(1),
  alertThreshold: Joi.number().min(1).max(100),
}).min(1);

module.exports = { createBudgetSchema, updateBudgetSchema };
