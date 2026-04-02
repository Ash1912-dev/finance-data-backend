const mongoose = require('mongoose');
const { USER_STATUS } = require('../../config/constants');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  status: { type: String, enum: Object.values(USER_STATUS), default: USER_STATUS.ACTIVE },
  lastLoginAt: { type: Date, default: null },
}, { timestamps: true });

userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

// strip passwordHash from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
