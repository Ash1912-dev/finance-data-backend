const Joi = require('joi');

const createRecordSchema = Joi.object({
  amount: Joi.number().min(0.01).required(),
  type: Joi.string().valid('income', 'expense').required(),
  category: Joi.string().trim().max(100).required(),
  date: Joi.date().iso(),
  notes: Joi.string().trim().max(500).allow(''),
  tags: Joi.array().items(Joi.string().trim()),
  isRecurring: Joi.boolean().default(false),
  recurrenceInterval: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly').when('isRecurring', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.forbidden()
  })
});

const updateRecordSchema = Joi.object({
  amount: Joi.number().min(0.01),
  type: Joi.string().valid('income', 'expense'),
  category: Joi.string().trim().max(100),
  date: Joi.date().iso(),
  notes: Joi.string().trim().max(500).allow(''),
  tags: Joi.array().items(Joi.string().trim()),
  isRecurring: Joi.boolean(),
  recurrenceInterval: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly')
}).min(1);

module.exports = { createRecordSchema, updateRecordSchema };
