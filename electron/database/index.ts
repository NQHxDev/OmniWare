import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

import { initDatabase } from './migrate';

let db: Database.Database;
let dbPath: string;

export function initDb() {
   dbPath = initDatabase();

   db = new Database(dbPath);
   db.pragma('foreign_keys = ON');

   return { db, dbPath };
}

export function getDb() {
   if (!db) throw new Error('DB chưa init');
   return db;
}
