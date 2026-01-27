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

   countAll() {
      try {
         const db = getDb();
         return db.prepare(`SELECT COUNT(*) as total FROM items`).get() as { total: number };
      } catch (error) {
         console.error('Get Count Item Error:', error);
         throw error;
      }
   },

   getPaged({ page, limit }: { page: number; limit: number }) {
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
                  i.low_stock_threshold
               FROM items i
               JOIN item_types it ON it.type_id = i.type_id
               JOIN units u ON u.unit_id = i.unit_id
               ORDER BY i.item_id DESC
               LIMIT ? OFFSET ?
            `
            )
            .all(limit, offset);
      } catch (error) {
         console.error('Get Item For Page Error:', error);
         throw error;
      }
   },

   getById(id: number) {
      try {
         const db = getDb();
         return db
            .prepare(
               `
               SELECT * FROM items WHERE item_id = ?
            `
            )
            .get(id);
      } catch (error) {
         console.error('Get Item By ID Error:', error);
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
         return db
            .prepare(
               `
                  INSERT INTO items (item_name, item_code, type_id, unit_id, low_stock_threshold)
                  VALUES (@item_name, @item_code, @type_id, @unit_id, @low_stock_threshold)
               `
            )
            .run(data);
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
