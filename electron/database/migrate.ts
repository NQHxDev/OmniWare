import fs from 'fs';
import path from 'path';
import { app } from 'electron';

export function initDatabase() {
   const rootPath = app.isPackaged ? path.dirname(process.execPath) : app.getAppPath();

   const userDbPath = path.join(rootPath, 'Database.sqlite3');

   if (!fs.existsSync(userDbPath)) {
      const sourceDb = app.isPackaged
         ? path.join(process.resourcesPath, 'Database.sqlite3')
         : path.join(app.getAppPath(), 'resources', 'Database.sqlite3');

      if (fs.existsSync(sourceDb)) {
         fs.copyFileSync(sourceDb, userDbPath);
         console.log('Khởi tạo Database tại thư mục cài đặt thành công');
      } else {
         console.warn('Không tìm thấy Database khi khởi tạo!');
      }
   } else {
      console.log('Systems: Database is running Successful');
   }

   return userDbPath;
}
