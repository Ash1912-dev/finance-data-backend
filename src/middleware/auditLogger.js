const AuditLog = require('../modules/audit/audit.model');

const SENSITIVE = ['password', 'passwordHash', 'token', 'refreshToken'];

const auditLogger = (action, resource) => (req, res, next) => {
  res.on('finish', async () => {
    try {
      if (!req.user) return;

      const payload = { ...req.body };
      SENSITIVE.forEach((k) => delete payload[k]);

      await AuditLog.create({
        userId: req.user._id,
        userEmail: req.user.email,
        action, resource,
        resourceId: req.params.id || null,
        method: req.method,
        route: req.originalUrl,
        ipAddress: req.ip,
        statusCode: res.statusCode,
        payload,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error('Audit log failed:', err.message);
    }
  });
  next();
};

module.exports = auditLogger;
