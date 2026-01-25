import fs from 'fs';
import path from 'path';
import { app } from 'electron';

export function initDatabase() {
   if (!app.isReady()) {
      throw new Error('App chưa ready, không thể lấy userData path');
   }

   const userDbPath = path.join(app.getPath('userData'), 'Database.sqlite3');

   if (!fs.existsSync(userDbPath)) {
      const resourcePath = app.isPackaged ? process.resourcesPath : app.getAppPath();

      const sourceDb = path.join(resourcePath, 'resources', 'Database.sqlite3');

      try {
         if (!fs.existsSync(sourceDb)) {
            throw new Error(`Không tìm thấy DB mẫu tại: ${sourceDb}`);
         }

         fs.copyFileSync(sourceDb, userDbPath);
         console.log('Đã copy Database mẫu thành công');
      } catch (err) {
         console.error('Lỗi init database:', err);
         throw err;
      }
   }

   return userDbPath;
}
