const ApiError = require('../utils/ApiError');

const authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    const userPerms = req.user?.role?.permissions || [];
    const hasAll = requiredPermissions.every((p) => userPerms.includes(p));
    if (!hasAll) throw new ApiError(403, 'Insufficient permissions', 'FORBIDDEN');
    next();
  };
};

module.exports = authorize;
