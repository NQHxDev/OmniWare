/* eslint-disable @typescript-eslint/no-explicit-any */
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

      const transaction = db.transaction((data) => {
         const info = db
            .prepare(
               `
                  INSERT INTO item_variants (item_id, variant_name, variant_code, quantity)
                  VALUES (@item_id, @variant_name, @variant_code, @quantity)
               `
            )
            .run(data);

         // Cập nhật bảng items
         db.prepare(
            `
               UPDATE items
               SET total_quantity = total_quantity + @quantity,
                  updated_at = CURRENT_TIMESTAMP
               WHERE item_id = @item_id
            `
         ).run(data);
         return info;
      });

      return transaction(data);
   },

   getByItemId(item_id: number) {
      const db = getDb();
      return db.prepare(`SELECT * FROM item_variants WHERE item_id = ?`).all(item_id);
   },

   stockSingleVariant(data: {
      variant_id: number;
      quantity: number;
      operation: 'in' | 'out'; // 'in' để nhập, 'out' để xuất
   }) {
      const db = getDb();

      // Sử dụng transaction để đảm bảo tính nhất quán
      const transaction = db.transaction((data) => {
         const { variant_id, quantity, operation } = data;

         // Lấy thông tin biến thể và item_id
         const variant = db
            .prepare(`SELECT * FROM item_variants WHERE variant_id = ?`)
            .get(variant_id);

         if (!variant) {
            throw new Error(`Variant with id ${variant_id} not found`);
         }

         const item_id = (variant as any).item_id;
         const currentQuantity = (variant as any).quantity;

         // Kiểm tra số lượng xuất không vượt quá tồn kho
         if (operation === 'out' && quantity > currentQuantity) {
            throw new Error(
               `Số lượng xuất (${quantity}) vượt quá tồn kho hiện tại (${currentQuantity})`
            );
         }

         // Tính toán số lượng mới
         const newQuantity =
            operation === 'in' ? currentQuantity + quantity : currentQuantity - quantity;

         // Cập nhật số lượng biến thể
         db.prepare(
            `
               UPDATE item_variants
               SET quantity = ?
               WHERE variant_id = ?
            `
         ).run(newQuantity, variant_id);

         // Tính toán thay đổi cho tổng số lượng items
         const quantityChange = operation === 'in' ? quantity : -quantity;

         // Cập nhật tổng số lượng trong bảng items
         db.prepare(
            `
               UPDATE items
               SET total_quantity = total_quantity + ?,
                  updated_at = CURRENT_TIMESTAMP
               WHERE item_id = ?
            `
         ).run(quantityChange, item_id);

         // Ghi log lịch sử nhập/xuất
         db.prepare(
            `
          INSERT INTO stock_history
          (variant_id, item_id, operation, quantity, previous_quantity, new_quantity, created_at)
          VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `
         ).run(variant_id, item_id, operation, quantity, currentQuantity, newQuantity);

         return {
            variant_id,
            item_id,
            previous_quantity: currentQuantity,
            new_quantity: newQuantity,
            operation,
            quantity_changed: quantityChange,
         };
      });

      return transaction(data);
   },

   stockMultipleVariants(data: {
      variant_ids: number[];
      quantity: number;
      operation: 'in' | 'out';
   }) {
      const db = getDb();

      const transaction = db.transaction((data) => {
         const { variant_ids, quantity, operation } = data;
         const results = [];

         for (const variant_id of variant_ids) {
            // Lấy thông tin biến thể
            const variant = db
               .prepare(`SELECT * FROM item_variants WHERE variant_id = ?`)
               .get(variant_id);

            if (!variant) {
               throw new Error(`Variant with id ${variant_id} not found`);
            }

            const item_id = (variant as any).item_id;
            const currentQuantity = (variant as any).quantity;

            // Kiểm tra số lượng xuất không vượt quá tồn kho
            if (operation === 'out' && quantity > currentQuantity) {
               throw new Error(
                  `Variant ${variant_id}: Số lượng xuất (${quantity}) vượt quá tồn kho hiện tại (${currentQuantity})`
               );
            }

            // Tính toán số lượng mới
            const newQuantity =
               operation === 'in' ? currentQuantity + quantity : currentQuantity - quantity;

            // Cập nhật số lượng biến thể
            db.prepare(
               `
            UPDATE item_variants
            SET quantity = ?
            WHERE variant_id = ?
          `
            ).run(newQuantity, variant_id);

            // Ghi log lịch sử nhập/xuất
            db.prepare(
               `
            INSERT INTO stock_history
            (variant_id, item_id, operation, quantity, previous_quantity, new_quantity, created_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `
            ).run(variant_id, item_id, operation, quantity, currentQuantity, newQuantity);

            results.push({
               variant_id,
               item_id,
               previous_quantity: currentQuantity,
               new_quantity: newQuantity,
               operation,
            });
         }

         // Tính tổng thay đổi cho mỗi item
         const itemChanges = new Map();
         for (const variant_id of variant_ids) {
            const variant = db
               .prepare(`SELECT item_id FROM item_variants WHERE variant_id = ?`)
               .get(variant_id);

            const item_id = (variant as any).item_id;
            const change = operation === 'in' ? quantity : -quantity;

            itemChanges.set(item_id, (itemChanges.get(item_id) || 0) + change);
         }

         // Cập nhật tổng số lượng cho từng item
         for (const [item_id, totalChange] of itemChanges.entries()) {
            db.prepare(
               `
                  UPDATE items
                  SET total_quantity = total_quantity + ?,
                  updated_at = CURRENT_TIMESTAMP
                  WHERE item_id = ?
               `
            ).run(totalChange, item_id);
         }

         return {
            success: true,
            count: variant_ids.length,
            operation,
            total_quantity_changed: variant_ids.length * quantity,
            results,
         };
      });

      return transaction(data);
   },

   deleteVariants(variant_ids: number[]) {
      const db = getDb();

      // Khai báo transaction. Lưu ý: callback nhận ids
      const executeDelete = db.transaction((ids: number[]) => {
         const placeholders = ids.map(() => '?').join(',');

         // Lấy thông tin
         const variants = db
            .prepare(
               `
               SELECT variant_id, item_id, quantity
               FROM item_variants
               WHERE variant_id IN (${placeholders})
            `
            )
            .all(...ids) as Array<{ variant_id: number; item_id: number; quantity: number }>;

         if (variants.length === 0) return { success: true, deleted_count: 0 };

         // Gom nhóm thay đổi
         const itemChanges = new Map<number, number>();
         variants.forEach(({ item_id, quantity }) => {
            itemChanges.set(item_id, (itemChanges.get(item_id) || 0) - quantity);
         });

         // Ghi history
         const insertHistory = db.prepare(`
            INSERT INTO stock_history (
               operation,
               item_id,
               variant_id,
               quantity,
               previous_quantity,
               new_quantity,
               created_at
            )
            VALUES ('delete', ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
         `);

         for (const v of variants) {
            insertHistory.run(v.item_id, v.variant_id, v.quantity, v.quantity);
         }

         // Xóa variants
         db.prepare(`DELETE FROM item_variants WHERE variant_id IN (${placeholders})`).run(...ids);

         // Update Items
         const updateItem = db.prepare(`
            UPDATE items
            SET total_quantity = total_quantity + ?,
               updated_at = CURRENT_TIMESTAMP
            WHERE item_id = ?
         `);

         for (const [item_id, change] of itemChanges.entries()) {
            updateItem.run(change, item_id);
         }

         return { success: true, deleted_count: variants.length };
      });

      return executeDelete(variant_ids);
   },

   existedVariantCode(item_id: number, variant_code: string) {
      try {
         const db = getDb();
         const row = db
            .prepare('SELECT 1 FROM item_variants WHERE item_id = ? AND variant_code = ? LIMIT 1')
            .get(item_id, variant_code);

         // Đã tồn tại (true), ngược lại là chưa (false)
         return !!row;
      } catch (error) {
         console.error('Check VariantCode Error:', error);
         throw error;
      }
   },
};
