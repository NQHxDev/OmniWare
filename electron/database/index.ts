import { createRequire } from 'module';
import { Database as DatabaseInstanceType } from 'better-sqlite3';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3') as unknown as typeof import('better-sqlite3');

import { initDatabase } from './migrate';

let db: DatabaseInstanceType | null = null;
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
