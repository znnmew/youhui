const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'data.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS indicators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    group_name TEXT NOT NULL,
    reports TEXT DEFAULT '[]',
    platforms TEXT DEFAULT '[]',
    dataSource TEXT DEFAULT '',
    maintainer TEXT DEFAULT '',
    status TEXT DEFAULT '草稿',
    definition TEXT DEFAULT '',
    remark TEXT DEFAULT '',
    goLiveTime TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS operation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    indicatorId INTEGER NOT NULL,
    indicatorName TEXT NOT NULL,
    operation TEXT NOT NULL,
    operator TEXT DEFAULT 'system',
    details TEXT DEFAULT '',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;
