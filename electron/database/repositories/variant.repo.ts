import { getDb } from '..';

export const VariantRepository = {
   getByItem(itemId: number) {
      const db = getDb();
      return db
         .prepare(
            `
               SELECT * FROM item_variants
               WHERE item_id = ?
            `
         )
         .all(itemId);
   },

   create(data: { item_id: number; variant_name: string; variant_code: string; quantity: number }) {
      const db = getDb();
      return db
         .prepare(
            `
               INSERT INTO item_variants (item_id, variant_name, variant_code, quantity)
               VALUES (@item_id, @variant_name, @variant_code, @quantity)
            `
         )
         .run(data);
   },

   getByItemId(item_id: number) {
      const db = getDb();
      return db.prepare(`SELECT * FROM item_variants WHERE item_id = ?`).all(item_id);
   },
};
