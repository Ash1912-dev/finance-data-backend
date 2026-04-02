const FinancialRecord = require('./record.model');
const ApiError = require('../../utils/ApiError');
const { paginate } = require('../../utils/pagination');

const calculateNextRecurrence = (date, interval) => {
  if (!interval) return null;
  const nextDate = new Date(date);
  switch (interval) {
    case 'daily': nextDate.setDate(nextDate.getDate() + 1); break;
    case 'weekly': nextDate.setDate(nextDate.getDate() + 7); break;
    case 'monthly': nextDate.setMonth(nextDate.getMonth() + 1); break;
    case 'yearly': nextDate.setFullYear(nextDate.getFullYear() + 1); break;
  }
  return nextDate;
};

const getRecords = async ({ type, category, startDate, endDate, page = 1, limit = 10, sortBy = 'date', order = 'desc' }) => {
  const query = { isDeleted: false };
  if (type) query.type = type;
  if (category) query.category = category.toLowerCase();
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const allowedSortFields = ['date', 'amount', 'category', 'type', 'createdAt'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'date';
  const sortOptions = { [sortField]: order === 'asc' ? 1 : -1 };

  return paginate(query, FinancialRecord, page, limit, [{ path: 'userId', select: 'name email' }], sortOptions);
};

const getRecordById = async (recordId) => {
  const record = await FinancialRecord.findOne({ _id: recordId, isDeleted: false }).populate('userId', 'name email').lean();
  if (!record) throw new ApiError(404, 'Record not found', 'RECORD_NOT_FOUND');
  return record;
};

const createRecord = async ({ userId, amount, type, category, date, notes, tags, isRecurring, recurrenceInterval }) => {
  const recordDate = date || new Date();
  const nextRecurrenceDate = isRecurring ? calculateNextRecurrence(recordDate, recurrenceInterval) : null;

  const record = await FinancialRecord.create({
    userId, amount, type, category: category.toLowerCase(),
    date: recordDate, notes: notes || '', tags: tags || [],
    isRecurring, recurrenceInterval, nextRecurrenceDate
  });

  return FinancialRecord.findById(record._id).populate('userId', 'name email').lean();
};

const updateRecord = async (recordId, updates) => {
  const record = await FinancialRecord.findOne({ _id: recordId, isDeleted: false });
  if (!record) throw new ApiError(404, 'Record not found', 'RECORD_NOT_FOUND');

  const allowed = ['amount', 'type', 'category', 'date', 'notes', 'tags', 'isRecurring', 'recurrenceInterval'];
  allowed.forEach(field => {
    if (updates[field] !== undefined) {
      record[field] = field === 'category' ? updates[field].toLowerCase() : updates[field];
    }
  });

  if (updates.isRecurring !== undefined || updates.recurrenceInterval !== undefined || updates.date !== undefined) {
    if (record.isRecurring) {
        record.nextRecurrenceDate = calculateNextRecurrence(record.date, record.recurrenceInterval);
    } else {
        record.nextRecurrenceDate = null;
        record.recurrenceInterval = null;
    }
  }

  await record.save();
  return FinancialRecord.findById(record._id).populate('userId', 'name email').lean();
};

const deleteRecord = async (recordId, deletedByUserId) => {
  const record = await FinancialRecord.findOne({ _id: recordId, isDeleted: false });
  if (!record) throw new ApiError(404, 'Record not found', 'RECORD_NOT_FOUND');

  record.isDeleted = true;
  record.deletedAt = new Date();
  record.deletedBy = deletedByUserId;
  await record.save();

  return record.toObject();
};

const exportRecordsCsv = async (query = {}) => {
  const records = await FinancialRecord.find({ ...query, isDeleted: false })
    .populate('userId', 'name email')
    .sort({ date: -1 })
    .lean();

  if (!records.length) return 'ID,Date,User,Email,Type,Category,Amount,Notes\n';

  const header = 'ID,Date,User,Email,Type,Category,Amount,Notes\n';
  const rows = records.map(r => {
    const notes = r.notes ? `"${r.notes.replace(/"/g, '""')}"` : '';
    return `${r._id},${r.date.toISOString()},${r.userId?.name || 'Unknown'},${r.userId?.email || 'Unknown'},${r.type},${r.category},${r.amount},${notes}`;
  }).join('\n');

  return header + rows;
};

module.exports = { getRecords, getRecordById, createRecord, updateRecord, deleteRecord, exportRecordsCsv };
