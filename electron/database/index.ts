import fs from 'fs';
import { createRequire } from 'module';
import { Database as DatabaseInstanceType } from 'better-sqlite3';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3') as unknown as typeof import('better-sqlite3');

import { initDatabase } from './migrate';

let db: DatabaseInstanceType | null = null;
let dbPath: string;

export function initDb() {
   dbPath = initDatabase();

   if (!fs.existsSync(dbPath)) {
      throw new Error(
         `Systems: File Database không tồn tại tại ${dbPath}. Ứng dụng không thể khởi động`
      );
   }

   db = new Database(dbPath, {
      fileMustExist: true, // Không cho phép tự tạo file rỗng
      // verbose: console.log, // Debug Query SQL
   });
   db.pragma('foreign_keys = ON');

   return { db, dbPath };
}

export function getDb() {
   if (!db) throw new Error('DB chưa init');
   return db;
}
