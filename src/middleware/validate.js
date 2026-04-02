const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const msg = error.details.map((d) => d.message).join(', ');
    throw new ApiError(400, msg, 'VALIDATION_ERROR');
  }
  next();
};

module.exports = validate;
