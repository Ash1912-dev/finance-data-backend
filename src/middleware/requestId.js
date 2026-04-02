const crypto = require('crypto');

// attaches a unique correlation ID to every request/response for traceability
const requestId = (req, res, next) => {
  const id = req.headers['x-request-id'] || crypto.randomUUID();
  req.requestId = id;
  res.set('X-Request-Id', id);
  next();
};

module.exports = requestId;
