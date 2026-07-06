const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  try {
    const { indicatorId, page = 1, pageSize = 20 } = req.query;
    let where = '1=1';
    const params = [];
    if (indicatorId) {
      where += ' AND indicatorId = ?';
      params.push(indicatorId);
    }

    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM operation_logs WHERE ${where}`);
    const { total } = countStmt.get(...params);

    const listStmt = db.prepare(`
      SELECT * FROM operation_logs WHERE ${where}
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `);
    const list = listStmt.all(...params, Number(pageSize), (Number(page) - 1) * Number(pageSize));

    res.json({ success: true, data: { list, total, page: Number(page), pageSize: Number(pageSize) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
