import { app, BrowserWindow, Menu } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { initDb } from './database';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.dirname(currentDir);

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(appRoot, 'dist-electron');
export const RENDERER_DIST = path.join(appRoot, 'dist');

const publicPath = VITE_DEV_SERVER_URL ? path.join(appRoot, 'public') : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
   win = new BrowserWindow({
      icon: path.join(publicPath, 'favicon.ico'),
      webPreferences: {
         preload: path.join(currentDir, 'preload.js'),
      },
   });

   win.maximize();

   win.webContents.on('did-finish-load', () => {
      win?.webContents.send('main-process-message', new Date().toLocaleString());
   });

   if (VITE_DEV_SERVER_URL) {
      win.loadURL(VITE_DEV_SERVER_URL);
   } else {
      win.loadFile(path.join(RENDERER_DIST, 'index.html'));
   }
}

app.on('window-all-closed', () => {
   if (process.platform !== 'darwin') {
      app.quit();
      win = null;
   }
});

app.on('activate', () => {
   if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
   }
});

app.whenReady().then(() => {
   try {
      const { dbPath } = initDb();
   } catch (error) {
      console.error('Khởi tạo Database thất bại:', error);
   }

   Menu.setApplicationMenu(null);
   createWindow();
});
