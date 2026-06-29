const QRCode = require('qrcode');
const db = require('../config/database');

exports.getTables = (req, res, next) => {
  try {
    const tables = db.prepare('SELECT * FROM tables ORDER BY table_number').all();
    res.status(200).json({ success: true, count: tables.length, tables });
  } catch (error) {
    next(error);
  }
};

exports.getTable = (req, res, next) => {
  try {
    const table = db.prepare('SELECT * FROM tables WHERE table_number = ?').get(req.params.tableNumber);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }
    res.status(200).json({ success: true, table });
  } catch (error) {
    next(error);
  }
};

exports.generateTableQR = async (req, res, next) => {
  try {
    const table_id = req.body.table_id || req.body.tableId;

    if (!table_id) {
      return res.status(400).json({ success: false, message: 'Please provide table_id' });
    }

    const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(table_id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const scanUrl = `${frontendUrl}/scan?table=${table.table_number}`;

    try {
      const qrDataUrl = await QRCode.toDataURL(scanUrl, { width: 300, margin: 2 });

      db.prepare('UPDATE tables SET qr_code_url = ? WHERE id = ?').run(qrDataUrl, table_id);

      res.status(200).json({ success: true, table: { ...table, qr_code_url: qrDataUrl }, scanUrl });
    } catch (qrError) {
      return res.status(500).json({ success: false, message: 'Failed to generate QR code' });
    }
  } catch (error) {
    next(error);
  }
};

exports.updateTableStatus = (req, res, next) => {
  try {
    const { status } = req.body;
    const tableId = req.params.id;

    if (!status || !['available', 'occupied'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid status (available or occupied)' });
    }

    const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(tableId);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    db.prepare('UPDATE tables SET status = ? WHERE id = ?').run(status, tableId);

    const updatedTable = db.prepare('SELECT * FROM tables WHERE id = ?').get(tableId);

    res.status(200).json({ success: true, table: updatedTable });
  } catch (error) {
    next(error);
  }
};
