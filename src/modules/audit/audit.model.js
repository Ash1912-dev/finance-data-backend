const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  userEmail: { type: String, default: '' },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId, default: null },
  method: { type: String, default: '' },
  route: { type: String, default: '' },
  ipAddress: { type: String, default: '' },
  statusCode: { type: Number, default: null },
  payload: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: false }); // audit logs are immutable

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
