import path from 'path';
import { promises as fs } from 'fs';
import { app } from 'electron';

const getSettingsPath = () => {
   return path.join(app.getAppPath(), 'resources', 'settings.json');
};

export const initializeSettingsFile = async () => {
   const settingsPath = getSettingsPath();
   const defaultSettings = {
      limit: 8,
      theme: 'light',
      language: 'vi',
      autoRefresh: false,
      refreshInterval: 30,
      logRetention: 3,
   };

   try {
      await fs.access(settingsPath);
      console.log('Systems: Init File Setting Success');
   } catch (error) {
      // File không tồn tại, tạo mới
      await fs.mkdir(path.dirname(settingsPath), { recursive: true });
      await fs.writeFile(settingsPath, JSON.stringify(defaultSettings, null, 2), 'utf-8');

      console.log('Systems: Create File Setting Success');
   }
};

export const readSettings = async () => {
   try {
      const settingsPath = getSettingsPath();
      const data = await fs.readFile(settingsPath, 'utf-8');
      return JSON.parse(data);
   } catch (error) {
      console.error('Error reading settings:', error);
      return null;
   }
};

export const writeSettings = async (settings: unknown) => {
   try {
      const settingsPath = getSettingsPath();
      await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
      return { success: true };
   } catch (error) {
      console.error('Error writing settings:', error);
      return {
         success: false,
         error:
            typeof error === 'object' && error !== null && 'message' in error
               ? (error as { message: string }).message
               : String(error),
      };
   }
};
