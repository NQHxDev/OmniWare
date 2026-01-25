import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// npx tsx ./electron/database/database.ts

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const electronDir = path.join(currentDir, '..');
const dir = path.join(electronDir, 'database');
const sqlFile = path.join(dir, 'schema.sql');
const dbFile = path.join(dir, 'Database.sqlite3');

try {
   const schema = fs.readFileSync(sqlFile, 'utf8');

   // Tạo file database mới
   const db = new Database(dbFile);

   // Thực thi các câu lệnh SQL để tạo bảng
   db.exec(schema);

   console.log('--- THÀNH CÔNG ---');
   console.log('Đã chuyển đổi file văn bản thành Database SQLite chuẩn.');

   // Test truy vấn thử
   const row = db.prepare('SELECT * FROM item_types WHERE type_code = ?').get('product');
   console.log('Dữ liệu mẫu trong DB:', row);

   db.close();
} catch (err) {
   console.error('Lỗi:', (err as Error).message);
}
