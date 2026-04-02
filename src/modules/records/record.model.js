const mongoose = require('mongoose');
const { RECORD_TYPES } = require('../../config/constants');

const recordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0.01 },
  type: { type: String, enum: Object.values(RECORD_TYPES), required: true },
  category: { type: String, required: true, trim: true, lowercase: true },
  date: { type: Date, required: true, default: Date.now },
  notes: { type: String, trim: true, maxlength: 500, default: '' },
  tags: { type: [String], default: [] },
  isRecurring: { type: Boolean, default: false },
  recurrenceInterval: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly', null], default: null },
  nextRecurrenceDate: { type: Date, default: null },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

recordSchema.index({ userId: 1, date: -1 });
recordSchema.index({ category: 1, type: 1 });
recordSchema.index({ isDeleted: 1 });
recordSchema.index({ date: -1 });
recordSchema.index({ nextRecurrenceDate: 1, isRecurring: 1 });

const excludeDeleted = function (next) {
  if (this.getFilter().isDeleted === undefined) this.where({ isDeleted: false });
  next();
};

recordSchema.pre('find', excludeDeleted);
recordSchema.pre('findOne', excludeDeleted);
recordSchema.pre('countDocuments', excludeDeleted);

module.exports = mongoose.model('FinancialRecord', recordSchema);
