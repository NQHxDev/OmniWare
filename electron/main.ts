/* eslint-disable @typescript-eslint/no-unused-vars */
import { app, BrowserWindow, Menu } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { getDb } from './database/index';

import { ipcMain } from 'electron';

import { initDb } from './database';

import { UnitRepository } from './database/repositories/unit.repo';
import { ItemRepository } from './database/repositories/item.repo';
import { VariantRepository } from './database/repositories/variant.repo';
import { initializeSettingsFile, readSettings, writeSettings } from './database/setting.json';
import {
   GetTransactionsParams,
   CreateTransactionParams,
   TransactionRepository,
} from './database/repositories/transaction.repo';

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
         preload: path.join(currentDir, 'preload.mjs'),
         sandbox: false,
         contextIsolation: true,
         spellcheck: false,
      },
   });

   // win.webContents.openDevTools();
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

export const cleanupOldLogs = (retentionMonths: number) => {
   if (!retentionMonths || retentionMonths <= 0) return;

   const db = getDb();

   const stmt = db.prepare(`
      DELETE FROM stock_history
      WHERE created_at < datetime('now', '-' || ? || ' months')
   `);

   const result = stmt.run(retentionMonths);

   console.log(
      `[LogCleanup] Deleted ${result.changes} log(s) older than ${retentionMonths} month(s)`
   );
};

app.whenReady().then(async () => {
   try {
      const { dbPath } = initDb();
      initializeSettingsFile();
      const settings = await readSettings();

      if (settings?.logRetention !== undefined) {
         cleanupOldLogs(settings.logRetention);
      }

      // Setting
      ipcMain.handle('read-settings', async () => {
         return await readSettings();
      });
      ipcMain.handle('write-settings', async (_, settings) => {
         return await writeSettings(settings);
      });

      ipcMain.handle('units:get-all', () => UnitRepository.getAll());
      ipcMain.handle('units:update', (_, id, slug, name) => UnitRepository.update(id, slug, name));

      // Item
      ipcMain.handle(
         'items:create',
         (_, item_name, item_code, type_id, unit_id, low_stock_threshold) =>
            ItemRepository.create({ item_name, item_code, type_id, unit_id, low_stock_threshold })
      );
      ipcMain.handle(
         'items:update',
         (_, item_id, item_name, item_code, unit_id, low_stock_threshold) =>
            ItemRepository.update({ item_id, item_name, item_code, unit_id, low_stock_threshold })
      );
      ipcMain.handle('items:get-paged', (_, page, type_item, limit) => {
         return {
            items: ItemRepository.getPaged({ page, type_item, limit }),
            total: ItemRepository.countItem(type_item),
         };
      });
      ipcMain.handle('items:delete', (_, item_id) => ItemRepository.delete(item_id));
      ipcMain.handle('items:stock-inventory', (_, item_id, quantity, operation) =>
         ItemRepository.stockInventoryItem(item_id, quantity, operation)
      );
      ipcMain.handle('item:get-count', (_, type_item) => ItemRepository.countItem(type_item));
      ipcMain.handle('item:get-low-stock', (_, type_item) =>
         ItemRepository.getItemLowStock(type_item)
      );

      // Variant
      ipcMain.handle('variants:get-by-item', (_, itemId: number) =>
         VariantRepository.getByItemId(itemId)
      );
      ipcMain.handle(
         'variants:create',
         (_, item_id: number, variant_name: string, variant_code: string, quantity: number) => {
            return VariantRepository.create({
               item_id,
               variant_name,
               variant_code,
               quantity: quantity,
            });
         }
      );
      ipcMain.handle('variants:delete', (_, variant_ids: number[]) =>
         VariantRepository.deleteVariants(variant_ids)
      );
      ipcMain.handle(
         'variants:stock-single-variant',
         (_, variant_id: number, quantity: number, operation: 'in' | 'out') =>
            VariantRepository.stockSingleVariant({
               variant_id,
               quantity,
               operation,
            })
      );
      ipcMain.handle(
         'variants:stock-multiple-variant',
         (_, variant_ids: number[], quantity: number, operation: 'in' | 'out') =>
            VariantRepository.stockMultipleVariants({
               variant_ids,
               quantity,
               operation,
            })
      );

      // Transaction
      ipcMain.handle('transaction:get-transactions', (_, params: GetTransactionsParams) =>
         TransactionRepository.getTransactions(params)
      );
      ipcMain.handle('transaction:create', (_, params: CreateTransactionParams) =>
         TransactionRepository.createTransaction(params)
      );
      ipcMain.handle('transaction:today-net-flow', (_) => TransactionRepository.getTodayNetFlow());
   } catch (error) {
      console.error('Khởi tạo Database thất bại:', error);
   }

   Menu.setApplicationMenu(null);
   createWindow();
});
