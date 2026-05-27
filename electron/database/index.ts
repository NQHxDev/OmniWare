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

   // Tối ưu hiệu năng SQLite
   db.pragma('journal_mode = WAL');       // Ghi nhật ký trước (Write-Ahead Logging) giúp tăng tốc độ đọc/ghi đồng thời
   db.pragma('synchronous = NORMAL');     // Giảm mức độ đồng bộ ổ đĩa mà vẫn đảm bảo an toàn trong WAL mode
   db.pragma('temp_store = MEMORY');      // Lưu trữ bảng tạm trên RAM thay vì đĩa cứng
   db.pragma('cache_size = -2000');       // Tăng kích thước bộ nhớ đệm cache lên khoảng 2MB

   return { db, dbPath };
}

export function getDb() {
   if (!db) throw new Error('DB chưa init');
   return db;
}
