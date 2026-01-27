import { getDb } from '..';

export const ItemRepository = {
   getAll() {
      try {
         const db = getDb();
         return db
            .prepare(
               `
               SELECT
               i.item_id,
               i.item_name,
               i.item_code,
               it.type_code AS item_type,
               i.unit,
               i.total_quantity
               FROM items i
               JOIN item_types it ON it.type_id = i.type_id
            `
            )
            .all();
      } catch (error) {
         console.error('Get All Item Error:', error);
         throw error;
      }
   },

   countItem(type_item: number) {
      try {
         const db = getDb();
         // Get All Type
         if (type_item === 0) {
            return db.prepare(`SELECT COUNT(*) as total FROM items`).get() as { total: number };
         }

         return db
            .prepare(`SELECT COUNT(*) as total FROM items WHERE type_id = ?`)
            .get(type_item) as { total: number };
      } catch (error) {
         console.error('Get Count Item Error:', error);
         throw error;
      }
   },

   getPaged({ page, type_item, limit }: { page: number; type_item: number; limit: number }) {
      try {
         const db = getDb();
         const offset = (page - 1) * limit;

         return db
            .prepare(
               `
               SELECT
                  i.item_id,
                  i.item_name,
                  i.item_code,
                  it.type_code AS item_type,
                  u.unit_name,
                  i.total_quantity,
                  i.is_low_stock,
                  i.low_stock_threshold,
                  (SELECT COUNT(*) FROM item_variants iv WHERE iv.item_id = i.item_id) as count_variant
               FROM items i
               JOIN item_types it ON it.type_id = i.type_id
               JOIN units u ON u.unit_id = i.unit_id
               WHERE (i.type_id = ? OR ? = 0) -- 0: get All
               ORDER BY i.item_id DESC
               LIMIT ? OFFSET ?
            `
            )
            .all(type_item, type_item, limit, offset);
      } catch (error) {
         console.error('Get Item For Page Error:', error);
         throw error;
      }
   },

   getById(item_id: number) {
      try {
         const db = getDb();
         return db
            .prepare(
               `
               SELECT * FROM items WHERE item_id = ?
            `
            )
            .get(item_id);
      } catch (error) {
         console.error('Get Item By ID Error:', error);
         throw error;
      }
   },

   getItemLowStock(type_item: number) {
      try {
         const db = getDb();
         const query = `
            SELECT
               i.item_id,
               i.item_name,
               i.item_code,
               i.total_quantity as quantity,
               u.unit_name
            FROM items i
            JOIN units u ON i.unit_id = u.unit_id
            WHERE i.is_low_stock = 1 AND i.type_id = ?
            ORDER BY i.total_quantity ASC
         `;

         return db.prepare(query).all(type_item);
      } catch (error) {
         console.error('Get Low Stock Items Error:', error);
         throw error;
      }
   },

   create(data: {
      item_name: string;
      item_code: string;
      type_id: number;
      unit_id: number;
      low_stock_threshold: number;
   }) {
      try {
         const db = getDb();

         const result = db
            .prepare(
               `
                  INSERT INTO items (item_name, item_code, type_id, unit_id, low_stock_threshold)
                  VALUES (@item_name, @item_code, @type_id, @unit_id, @low_stock_threshold)
               `
            )
            .run(data);

         return { item_id: result.lastInsertRowid };
      } catch (error) {
         console.error('Create New Item Error:', error);
         throw error;
      }
   },

   update(data: {
      item_id: number;
      item_name: string;
      item_code: string;
      unit_id: number;
      low_stock_threshold: number;
   }) {
      try {
         const db = getDb();
         return db
            .prepare(
               `
               UPDATE items
               SET
                  item_name = @item_name,
                  item_code = @item_code,
                  unit_id = @unit_id,
                  low_stock_threshold = @low_stock_threshold,
                  updated_at = CURRENT_TIMESTAMP
               WHERE item_id = @item_id
            `
            )
            .run(data);
      } catch (error) {
         console.error('Update Item Error:', error);
         throw error;
      }
   },

   delete(itemId: number) {
      try {
         const db = getDb();
         db.prepare('PRAGMA foreign_keys = ON').run();

         const statement = db.prepare('DELETE FROM items WHERE item_id = ?');
         const result = statement.run(itemId);

         if (result.changes > 0) {
            return true;
         }
         return false;
      } catch (error) {
         console.error('Delete Item Error:', error);
         throw error;
      }
   },

   stockInventoryItem(itemId: number, quantity: number, operation: 'in' | 'out') {
      try {
         const db = getDb();
         const change = operation === 'in' ? quantity : -quantity;

         const updateTransaction = db.transaction(() => {
            const item = db
               .prepare('SELECT total_quantity FROM items WHERE item_id = ?')
               .get(itemId) as { total_quantity: number };

            if (!item) throw new Error('Sản phẩm không tồn tại');

            const newQty = item.total_quantity + change;
            if (newQty < 0) throw new Error('Số lượng tồn kho không đủ để xuất');

            db.prepare(
               `UPDATE items SET total_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE item_id = ?`
            ).run(newQty, itemId);

            db.prepare(
               `INSERT INTO stock_history (item_id, variant_id, operation, quantity, previous_quantity, new_quantity)
                VALUES (?, ?, ?, ?, ?, ?)`
            ).run(itemId, 0, operation, quantity, item.total_quantity, newQty);

            return { success: true, currentStock: newQty };
         });

         return updateTransaction();
      } catch (error) {
         console.error('Stock Inventory Item Error:', error);
         throw error;
      }
   },

   // existedItemCode(item_code: string) {
   //    try {
   //       const db = getDb();

   //       return false;
   //    } catch (error) {
   //       console.error('Check ItemCode Error:', error);
   //       throw error;
   //    }
   // },
};
