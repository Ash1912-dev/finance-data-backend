// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  // mongoose validation
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, error: messages.join(', '), code: 'VALIDATION_ERROR' });
  }

  // duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ success: false, error: `Duplicate value for ${field}`, code: 'DUPLICATE_ERROR' });
  }

  // invalid ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, error: `Invalid ${err.path}: ${err.value}`, code: 'CAST_ERROR' });
  }

  // JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, error: 'Invalid token', code: 'INVALID_TOKEN' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, error: 'Token has expired', code: 'TOKEN_EXPIRED' });
  }

  // known operational errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({ success: false, error: err.message, code: err.code });
  }

  // everything else is unexpected
  console.error('UNHANDLED:', err);
  return res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
};
