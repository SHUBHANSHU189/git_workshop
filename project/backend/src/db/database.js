import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../railblock.db');
sqlite3.verbose();

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database connection:', err);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Utility helpers for Async SQLite queries
export const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

export const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export async function initDb() {
  await runQuery(`DROP TABLE IF EXISTS users`);
  await runQuery(`DROP TABLE IF EXISTS corridors`);
  await runQuery(`DROP TABLE IF EXISTS tasks`);
  await runQuery(`DROP TABLE IF EXISTS availability_windows`);
  await runQuery(`DROP TABLE IF EXISTS scheduled_blocks`);

  await runQuery(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'Planner'
    )
  `);

  await runQuery(`
    CREATE TABLE corridors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      section_from TEXT NOT NULL,
      section_to TEXT NOT NULL,
      daily_traffic_json TEXT NOT NULL
    )
  `);

  await runQuery(`
    CREATE TABLE tasks (
      id TEXT PRIMARY KEY,
      department TEXT NOT NULL,
      corridor_id TEXT NOT NULL,
      section_name TEXT NOT NULL,
      description TEXT NOT NULL,
      defect_type TEXT NOT NULL,
      reported_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      is_overdue INTEGER NOT NULL,
      safety_criticality INTEGER NOT NULL,
      estimated_duration_hours REAL NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY(corridor_id) REFERENCES corridors(id)
    )
  `);

  await runQuery(`
    CREATE TABLE availability_windows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      corridor_id TEXT NOT NULL,
      date TEXT NOT NULL,
      start_hour INTEGER NOT NULL,
      end_hour INTEGER NOT NULL,
      available_from_timetable INTEGER NOT NULL,
      goods_train_forecast_conflict INTEGER NOT NULL,
      FOREIGN KEY(corridor_id) REFERENCES corridors(id)
    )
  `);

  await runQuery(`
    CREATE TABLE scheduled_blocks (
      id TEXT PRIMARY KEY,
      corridor_id TEXT NOT NULL,
      date TEXT NOT NULL,
      start_hour INTEGER NOT NULL,
      end_hour INTEGER NOT NULL,
      merged_task_ids_json TEXT NOT NULL,
      departments_json TEXT NOT NULL,
      risk_tag TEXT NOT NULL,
      status TEXT NOT NULL,
      horizon TEXT DEFAULT 'weekly',
      FOREIGN KEY(corridor_id) REFERENCES corridors(id)
    )
  `);
}
