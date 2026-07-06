const express = require('express');
const router = express.Router();
const db = require('../db');

function addLog(indicatorId, indicatorName, operation, details = '') {
  db.prepare('INSERT INTO operation_logs (indicatorId, indicatorName, operation, details) VALUES (?, ?, ?, ?)')
    .run(indicatorId, indicatorName, operation, details);
}

function parseRow(row) {
  return {
    ...row,
    reports: JSON.parse(row.reports || '[]'),
    platforms: JSON.parse(row.platforms || '[]')
  };
}

router.get('/', (req, res) => {
  try {
    const { keyword, group, status, dataSource, page = 1, pageSize = 20 } = req.query;
    let where = '1=1';
    const params = [];
    if (keyword) {
      where += ' AND (name LIKE ? OR definition LIKE ? OR remark LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    if (group) {
      where += ' AND group_name = ?';
      params.push(group);
    }
    if (status) {
      where += ' AND status = ?';
      params.push(status);
    }
    if (dataSource) {
      where += ' AND dataSource = ?';
      params.push(dataSource);
    }

    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM indicators WHERE ${where}`);
    const { total } = countStmt.get(...params);

    const listStmt = db.prepare(`
      SELECT * FROM indicators WHERE ${where}
      ORDER BY updatedAt DESC
      LIMIT ? OFFSET ?
    `);
    const list = listStmt.all(...params, Number(pageSize), (Number(page) - 1) * Number(pageSize)).map(parseRow);

    res.json({ success: true, data: { list, total, page: Number(page), pageSize: Number(pageSize) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/groups', (req, res) => {
  try {
    const rows = db.prepare('SELECT DISTINCT group_name FROM indicators ORDER BY group_name').all();
    res.json({ success: true, data: rows.map(r => r.group_name) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/sources', (req, res) => {
  try {
    const rows = db.prepare("SELECT DISTINCT dataSource FROM indicators WHERE dataSource != '' ORDER BY dataSource").all();
    res.json({ success: true, data: rows.map(r => r.dataSource) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM indicators WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: parseRow(row) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, group, reports, platforms, dataSource, maintainer, status, definition, remark, goLiveTime } = req.body;
    const now = new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO indicators (name, group_name, reports, platforms, dataSource, maintainer, status, definition, remark, goLiveTime, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, group, JSON.stringify(reports || []), JSON.stringify(platforms || []), dataSource || '', maintainer || '', status || '草稿', definition || '', remark || '', goLiveTime || null, now, now);
    const indicator = parseRow(db.prepare('SELECT * FROM indicators WHERE id = ?').get(result.lastInsertRowid));
    addLog(indicator.id, indicator.name, '创建指标', JSON.stringify(req.body));
    res.json({ success: true, data: indicator });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { name, group, reports, platforms, dataSource, maintainer, status, definition, remark, goLiveTime } = req.body;
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE indicators SET
        name = ?, group_name = ?, reports = ?, platforms = ?, dataSource = ?, maintainer = ?, status = ?, definition = ?, remark = ?, goLiveTime = ?, updatedAt = ?
      WHERE id = ?
    `).run(name, group, JSON.stringify(reports || []), JSON.stringify(platforms || []), dataSource || '', maintainer || '', status || '草稿', definition || '', remark || '', goLiveTime || null, now, req.params.id);
    const indicator = parseRow(db.prepare('SELECT * FROM indicators WHERE id = ?').get(req.params.id));
    if (!indicator) return res.status(404).json({ success: false, message: 'Not found' });
    addLog(indicator.id, indicator.name, '更新指标', JSON.stringify(req.body));
    res.json({ success: true, data: indicator });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const indicator = parseRow(db.prepare('SELECT * FROM indicators WHERE id = ?').get(req.params.id));
    if (!indicator) return res.status(404).json({ success: false, message: 'Not found' });
    db.prepare('DELETE FROM indicators WHERE id = ?').run(req.params.id);
    addLog(indicator.id, indicator.name, '删除指标', '');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/batch-update', (req, res) => {
  try {
    const { ids, data } = req.body;
    const fields = [];
    const values = [];
    if (data.group !== undefined) { fields.push('group_name = ?'); values.push(data.group); }
    if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
    if (data.dataSource !== undefined) { fields.push('dataSource = ?'); values.push(data.dataSource); }
    if (data.maintainer !== undefined) { fields.push('maintainer = ?'); values.push(data.maintainer); }
    if (data.goLiveTime !== undefined) { fields.push('goLiveTime = ?'); values.push(data.goLiveTime); }
    if (!fields.length) return res.status(400).json({ success: false, message: 'No fields to update' });
    fields.push('updatedAt = ?');
    values.push(new Date().toISOString());

    const placeholders = ids.map(() => '?').join(',');
    db.prepare(`UPDATE indicators SET ${fields.join(', ')} WHERE id IN (${placeholders})`).run(...values, ...ids);

    const indicators = db.prepare(`SELECT * FROM indicators WHERE id IN (${placeholders})`).all(...ids).map(parseRow);
    for (const item of indicators) {
      addLog(item.id, item.name, '批量修改', JSON.stringify(data));
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
