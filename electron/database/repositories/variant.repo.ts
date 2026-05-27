/* eslint-disable @typescript-eslint/no-explicit-any */
import { getDb } from '..';

// Cache chứa các statement được chuẩn bị trước (prepared statements) để tăng hiệu năng
let cachedStmts: any = null;

function getCachedStmts() {
   if (cachedStmts) return cachedStmts;
   const db = getDb();
   cachedStmts = {
      getByItem: db.prepare(`
         SELECT * FROM item_variants
         WHERE item_id = ?
      `),
      createVariant: db.prepare(`
         INSERT INTO item_variants (item_id, variant_name, variant_code, quantity)
         VALUES (@item_id, @variant_name, @variant_code, @quantity)
      `),
      updateItemTotalQuantityNamed: db.prepare(`
         UPDATE items
         SET total_quantity = total_quantity + @quantity,
             updated_at = CURRENT_TIMESTAMP
         WHERE item_id = @item_id
      `),
      getVariantById: db.prepare(`
         SELECT * FROM item_variants
         WHERE variant_id = ?
      `),
      updateVariantQuantity: db.prepare(`
         UPDATE item_variants
         SET quantity = ?
         WHERE variant_id = ?
      `),
      updateItemTotalQuantity: db.prepare(`
         UPDATE items
         SET total_quantity = total_quantity + ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE item_id = ?
      `),
      insertHistory: db.prepare(`
         INSERT INTO stock_history
         (variant_id, item_id, operation, quantity, previous_quantity, new_quantity, created_at)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `),
      checkCode: db.prepare(`
         SELECT 1 FROM item_variants
         WHERE item_id = ? AND variant_code = ?
         LIMIT 1
      `),
   };
   return cachedStmts;
}

export const VariantRepository = {
   getByItem(itemId: number) {
      return getCachedStmts().getByItem.all(itemId);
   },

   create(data: { item_id: number; variant_name: string; variant_code: string; quantity: number }) {
      const db = getDb();
      const stmts = getCachedStmts();

      const transaction = db.transaction((data) => {
         const info = stmts.createVariant.run(data);
         // Cập nhật bảng items
         stmts.updateItemTotalQuantityNamed.run(data);
         return info;
      });

      return transaction(data);
   },

   getByItemId(item_id: number) {
      return getCachedStmts().getByItem.all(item_id);
   },

   stockSingleVariant(data: {
      variant_id: number;
      quantity: number;
      operation: 'in' | 'out'; // 'in' để nhập, 'out' để xuất
   }) {
      const db = getDb();
      const stmts = getCachedStmts();

      // Sử dụng transaction để đảm bảo tính nhất quán
      const transaction = db.transaction((data) => {
         const { variant_id, quantity, operation } = data;

         // Lấy thông tin biến thể và item_id từ statement đã cache
         const variant = stmts.getVariantById.get(variant_id);

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
         stmts.updateVariantQuantity.run(newQuantity, variant_id);

         // Tính toán thay đổi cho tổng số lượng items
         const quantityChange = operation === 'in' ? quantity : -quantity;

         // Cập nhật tổng số lượng trong bảng items
         stmts.updateItemTotalQuantity.run(quantityChange, item_id);

         // Ghi log lịch sử nhập/xuất
         stmts.insertHistory.run(variant_id, item_id, operation, quantity, currentQuantity, newQuantity);

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
      const stmts = getCachedStmts();

      const transaction = db.transaction((data) => {
         const { variant_ids, quantity, operation } = data;
         const results = [];
         const itemChanges = new Map<number, number>();

         for (const variant_id of variant_ids) {
            // Lấy thông tin biến thể từ cache
            const variant = stmts.getVariantById.get(variant_id);

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
            stmts.updateVariantQuantity.run(newQuantity, variant_id);

            // Ghi log lịch sử nhập/xuất
            stmts.insertHistory.run(variant_id, item_id, operation, quantity, currentQuantity, newQuantity);

            results.push({
               variant_id,
               item_id,
               previous_quantity: currentQuantity,
               new_quantity: newQuantity,
               operation,
            });

            // Tích hợp gom nhóm thay đổi số lượng item tại đây, tránh vòng lặp select thừa từ Database
            const change = operation === 'in' ? quantity : -quantity;
            itemChanges.set(item_id, (itemChanges.get(item_id) || 0) + change);
         }

         // Cập nhật tổng số lượng cho từng item bằng statement đã cache
         for (const [item_id, totalChange] of itemChanges.entries()) {
            stmts.updateItemTotalQuantity.run(totalChange, item_id);
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
      const stmts = getCachedStmts();

      // Khai báo transaction
      const executeDelete = db.transaction((ids: number[]) => {
         const placeholders = ids.map(() => '?').join(',');

         // Lấy thông tin (Câu SELECT động nên không cache tĩnh)
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

         // Ghi history (Sử dụng statement cache)
         for (const v of variants) {
            stmts.insertHistory.run(v.variant_id, v.item_id, 'delete', v.quantity, v.quantity, 0);
         }

         // Xóa variants (SELECT động)
         db.prepare(`DELETE FROM item_variants WHERE variant_id IN (${placeholders})`).run(...ids);

         // Update Items (Sử dụng statement cache)
         for (const [item_id, change] of itemChanges.entries()) {
            stmts.updateItemTotalQuantity.run(change, item_id);
         }

         return { success: true, deleted_count: variants.length };
      });

      return executeDelete(variant_ids);
   },

   existedVariantCode(item_id: number, variant_code: string) {
      try {
         const row = getCachedStmts().checkCode.get(item_id, variant_code);
         // Đã tồn tại (true), ngược lại là chưa (false)
         return !!row;
      } catch (error) {
         console.error('Check VariantCode Error:', error);
         throw error;
      }
   },
};
