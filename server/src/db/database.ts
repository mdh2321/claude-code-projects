import Database from 'better-sqlite3';
import path from 'path';
import { createTables } from './schema';

const dbPath = path.join(__dirname, '../../data/recipes.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize tables
export function initDatabase() {
  db.exec(createTables);
  console.log('Database initialized successfully');
}

export default db;
