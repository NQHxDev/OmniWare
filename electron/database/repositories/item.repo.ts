import { getDb } from '..';

const db = getDb();

export const ItemRepository = {
   getAll() {
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

   getById(id: number) {
      return db
         .prepare(
            `
               SELECT * FROM items WHERE item_id = ?
            `
         )
         .get(id);
   },

   create(data: { item_name: string; item_code: string; type_id: number; unit: string }) {
      return db
         .prepare(
            `
               INSERT INTO items (item_name, item_code, type_id, unit)
               VALUES (@item_name, @item_code, @type_id, @unit)
            `
         )
         .run(data);
   },
};
