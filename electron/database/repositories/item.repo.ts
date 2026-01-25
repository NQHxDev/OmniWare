import { getDb } from '..';

export const ItemRepository = {
   getAll() {
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
   },

   countAll() {
      const db = getDb();
      return db.prepare(`SELECT COUNT(*) as total FROM items`).get() as { total: number };
   },

   getPaged({ page, limit }: { page: number; limit: number }) {
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
                  i.total_quantity
               FROM items i
               JOIN item_types it ON it.type_id = i.type_id
               ORDER BY i.item_id DESC
               LIMIT ? OFFSET ?
            `
         )
         .all(limit, offset);
   },

   getById(id: number) {
      const db = getDb();
      return db
         .prepare(
            `
               SELECT * FROM items WHERE item_id = ?
            `
         )
         .get(id);
   },

   create(data: { item_name: string; item_code: string; type_id: number; unit_id: number }) {
      const db = getDb();
      return db
         .prepare(
            `
               INSERT INTO items (item_name, item_code, type_id, unit_id)
               VALUES (@item_name, @item_code, @type_id, @unit_id)
            `
         )
         .run(data);
   },
};
