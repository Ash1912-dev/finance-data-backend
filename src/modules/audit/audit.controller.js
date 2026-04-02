const auditService = require('./audit.service');
const { sendPaginated } = require('../../utils/ApiResponse');

const getAuditLogs = async (req, res, next) => {
  try {
    const { userId, resource, action, page, limit } = req.query;
    const result = await auditService.getAuditLogs({ userId, resource, action, page, limit });
    return sendPaginated(res, result.data, result.pagination, 'Audit logs retrieved');
  } catch (err) { next(err); }
};

const getUserAuditTrail = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await auditService.getUserAuditTrail(req.params.userId, { page, limit });
    return sendPaginated(res, result.data, result.pagination, 'User audit trail retrieved');
  } catch (err) { next(err); }
};

module.exports = { getAuditLogs, getUserAuditTrail };
