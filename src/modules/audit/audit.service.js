const AuditLog = require('./audit.model');
const { paginate } = require('../../utils/pagination');

const getAuditLogs = async ({ userId, resource, action, page = 1, limit = 20 }) => {
  const query = {};
  if (userId) query.userId = userId;
  if (resource) query.resource = resource;
  if (action) query.action = action;

  return paginate(query, AuditLog, page, limit, [{ path: 'userId', select: 'name email' }], { createdAt: -1 });
};

const getUserAuditTrail = async (userId, { page = 1, limit = 20 }) => {
  return paginate({ userId }, AuditLog, page, limit, [], { createdAt: -1 });
};

module.exports = { getAuditLogs, getUserAuditTrail };
