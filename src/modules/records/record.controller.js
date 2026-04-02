const recordService = require('./record.service');
const { sendSuccess, sendPaginated } = require('../../utils/ApiResponse');

const getRecords = async (req, res, next) => {
  try {
    const result = await recordService.getRecords(req.query);
    return sendPaginated(res, result.data, result.pagination, 'Records retrieved');
  } catch (err) { next(err); }
};

const getRecordById = async (req, res, next) => {
  try {
    const record = await recordService.getRecordById(req.params.id);
    return sendSuccess(res, { record }, 'Record retrieved');
  } catch (err) { next(err); }
};

const createRecord = async (req, res, next) => {
  try {
    const record = await recordService.createRecord({ userId: req.user._id, ...req.body });
    return sendSuccess(res, { record }, 'Record created', 201);
  } catch (err) { next(err); }
};

const updateRecord = async (req, res, next) => {
  try {
    const record = await recordService.updateRecord(req.params.id, req.body);
    return sendSuccess(res, { record }, 'Record updated');
  } catch (err) { next(err); }
};

const deleteRecord = async (req, res, next) => {
  try {
    const record = await recordService.deleteRecord(req.params.id, req.user._id);
    return sendSuccess(res, { record }, 'Record deleted');
  } catch (err) { next(err); }
};

const exportCsv = async (req, res, next) => {
  try {
    const csvData = await recordService.exportRecordsCsv(req.query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="financial_records.csv"');
    res.status(200).send(csvData);
  } catch (err) { next(err); }
};

module.exports = { getRecords, getRecordById, createRecord, updateRecord, deleteRecord, exportCsv };
