const { Router } = require('express');
const ctrl = require('./record.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const auditLogger = require('../../middleware/auditLogger');
const { PERMISSIONS, AUDIT_ACTIONS } = require('../../config/constants');
const { createRecordSchema, updateRecordSchema } = require('../../validators/record.validator');

const router = Router();
router.use(authenticate);

router.get('/', authorize(PERMISSIONS.READ_RECORD), ctrl.getRecords);
router.get('/export/csv', authorize(PERMISSIONS.READ_RECORD), ctrl.exportCsv);
router.get('/:id', authorize(PERMISSIONS.READ_RECORD), ctrl.getRecordById);

router.post('/',
  authorize(PERMISSIONS.CREATE_RECORD),
  validate(createRecordSchema),
  auditLogger(AUDIT_ACTIONS.CREATE_RECORD, 'FinancialRecord'),
  ctrl.createRecord
);

router.patch('/:id',
  authorize(PERMISSIONS.UPDATE_RECORD),
  validate(updateRecordSchema),
  auditLogger(AUDIT_ACTIONS.UPDATE_RECORD, 'FinancialRecord'),
  ctrl.updateRecord
);

router.delete('/:id',
  authorize(PERMISSIONS.DELETE_RECORD),
  auditLogger(AUDIT_ACTIONS.DELETE_RECORD, 'FinancialRecord'),
  ctrl.deleteRecord
);

module.exports = router;
