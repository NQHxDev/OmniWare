import fs from 'fs';
import path from 'path';
import { app } from 'electron';

export function initDatabase() {
   if (!app.isReady()) {
      throw new Error('App chưa ready');
   }

   const userDbPath = path.join(app.getPath('userData'), 'Database.sqlite3');

   if (!fs.existsSync(userDbPath)) {
      const sourceDb = app.isPackaged
         ? path.join(process.resourcesPath, 'Database.sqlite3')
         : path.join(app.getAppPath(), 'resources', 'Database.sqlite3');

      if (!fs.existsSync(sourceDb)) {
         throw new Error(`Không tìm thấy DB mẫu tại: ${sourceDb}`);
      }

      fs.copyFileSync(sourceDb, userDbPath);
      console.log('Khởi tạo Database thành công');
   }

   return userDbPath;
}
