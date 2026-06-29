const express = require('express');
const router = express.Router();
const { getTables, getTable, generateTableQR, updateTableStatus } = require('../controllers/qrController');
const { protect, authorize } = require('../middleware/auth');

router.get('/tables', getTables);
router.get('/tables/:tableNumber', getTable);
router.post('/table/generate', protect, authorize(['admin']), generateTableQR);
router.put('/tables/:id/status', protect, authorize(['admin']), updateTableStatus);

module.exports = router;
