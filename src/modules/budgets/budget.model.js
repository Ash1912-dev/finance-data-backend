const mongoose = require('mongoose');
const { BUDGET_PERIODS } = require('../../config/constants');

const budgetSchema = new mongoose.Schema({
  category: { type: String, required: true, trim: true, lowercase: true },
  limitAmount: { type: Number, required: true, min: 1 },
  period: { type: String, enum: Object.values(BUDGET_PERIODS), required: true },
  alertThreshold: { type: Number, default: 80, min: 1, max: 100 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

budgetSchema.index({ category: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
