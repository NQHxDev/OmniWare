import { getDb } from '..';

const db = getDb();

export const VariantRepository = {
   getByItem(itemId: number) {
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
      return db
         .prepare(
            `
               INSERT INTO item_variants (item_id, variant_name, variant_code, quantity)
               VALUES (@item_id, @variant_name, @variant_code, @quantity)
            `
         )
         .run(data);
   },
};
