import { dialog } from 'electron';
import { getDb } from '../database';
import fs from 'fs/promises';
import { readSettings, writeSettings } from './setting.json';

export async function backupData() {
   const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Backup dữ liệu',
      defaultPath: `backup-${Date.now()}.json`,
      filters: [{ name: 'Backup File', extensions: ['json'] }],
   });

   if (canceled || !filePath) return { canceled: true };

   const db = getDb();

   const backup = {
      meta: {
         app: 'inventory-app',
         version: '1.0.0',
         createdAt: new Date().toISOString(),
      },
      settings: await readSettings(),
      data: {
         units: db.prepare('SELECT * FROM units').all(),
         item_types: db.prepare('SELECT * FROM item_types').all(),
         items: db.prepare('SELECT * FROM items').all(),
         item_variants: db.prepare('SELECT * FROM item_variants').all(),
         stock_history: db.prepare('SELECT * FROM stock_history').all(),
      },
   };

   await fs.writeFile(filePath, JSON.stringify(backup, null, 2), 'utf-8');

   return { success: true };
}

export async function restoreData() {
   const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Restore dữ liệu',
      filters: [{ name: 'Backup File', extensions: ['json'] }],
      properties: ['openFile'],
   });

   if (canceled || !filePaths[0]) return { canceled: true };

   const content = await fs.readFile(filePaths[0], 'utf-8');
   const backup = JSON.parse(content);

   const db = getDb();

   const trx = db.transaction(() => {
      db.exec(`
         DELETE FROM stock_history;
         DELETE FROM item_variants;
         DELETE FROM items;
         DELETE FROM item_types;
         DELETE FROM units;
      `);

      for (const row of backup.data.units) {
         db.prepare('INSERT INTO units (unit_id, unit_slug, unit_name) VALUES (?, ?, ?)').run(
            row.unit_id,
            row.unit_slug,
            row.unit_name
         );
      }

      for (const row of backup.data.item_types) {
         db.prepare('INSERT INTO item_types (type_id, type_code, type_name) VALUES (?, ?, ?)').run(
            row.type_id,
            row.type_code,
            row.type_name
         );
      }

      for (const row of backup.data.items) {
         db.prepare(
            `
            INSERT INTO items (
               item_id, item_name, item_code, type_id, unit_id,
               total_quantity, low_stock_threshold, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         `
         ).run(
            row.item_id,
            row.item_name,
            row.item_code,
            row.type_id,
            row.unit_id,
            row.total_quantity,
            row.low_stock_threshold,
            row.created_at,
            row.updated_at
         );
      }

      for (const row of backup.data.item_variants) {
         db.prepare(
            'INSERT INTO item_variants (variant_id, item_id, variant_name, variant_code, quantity) VALUES (?, ?, ?, ?, ?)'
         ).run(row.variant_id, row.item_id, row.variant_name, row.variant_code, row.quantity);
      }

      for (const row of backup.data.stock_history) {
         db.prepare(
            `
            INSERT INTO stock_history (
               history_id, item_id, variant_id, operation,
               quantity, previous_quantity, new_quantity, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         `
         ).run(
            row.history_id,
            row.item_id,
            row.variant_id,
            row.operation,
            row.quantity,
            row.previous_quantity,
            row.new_quantity,
            row.created_at
         );
      }
   });

   trx();

   if (backup.settings) {
      await writeSettings(backup.settings);
   }

   return { success: true };
}
