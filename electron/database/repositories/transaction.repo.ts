import { getDb } from '..';

export type TransactionType = 'create' | 'in' | 'out' | 'delete';

export interface GetTransactionsParams {
   search?: string;
   types?: TransactionType[];
   itemTypes?: number[];
   startDate?: string;
   endDate?: string;
   page: number;
   limit: number;
   sortField: string;
   sortDirection: 'asc' | 'desc';
}

export interface CreateTransactionParams {
   type: TransactionType;
   itemId: number;
   variantId?: number | null;
   quantity: number;
}

export const TransactionRepository = {
   getTransactions(params: GetTransactionsParams) {
      const db = getDb();
      const {
         search,
         types = [],
         itemTypes = [],
         startDate,
         endDate,
         page,
         limit,
         sortField,
         sortDirection,
      } = params;

      const offset = (page - 1) * limit;

      const where: string[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const values: any[] = [];

      if (search) {
         where.push(`
            (
               i.item_name LIKE ?
               OR i.item_code LIKE ?
               OR iv.variant_name LIKE ?
               OR iv.variant_code LIKE ?
            )
         `);
         values.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      }

      /* Transaction types */
      if (types.length > 0) {
         where.push(`sh.operation IN (${types.map(() => '?').join(',')})`);
         values.push(...types);
      }

      /* Item types */
      if (itemTypes.length > 0) {
         where.push(`it.type_id IN (${itemTypes.map(() => '?').join(',')})`);
         values.push(...itemTypes);
      }

      /* Date range */
      if (startDate) {
         where.push(`DATE(sh.created_at) >= DATE(?)`);
         values.push(startDate);
      }

      if (endDate) {
         where.push(`DATE(sh.created_at) <= DATE(?)`);
         values.push(endDate);
      }

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

      /* SORT – whitelist để tránh SQL injection */
      const SORT_FIELDS: Record<string, string> = {
         created_at: 'sh.created_at',
         quantity: 'sh.quantity',
         type: 'sh.operation',
         user_name: 'u.user_name',
      };

      const orderBy = SORT_FIELDS[sortField] ?? 'sh.created_at';

      /* Query data */
      const data = db
         .prepare(
            `
            SELECT
               sh.history_id,
               sh.operation AS type,
               i.item_id,
               i.item_name,
               i.item_code,
               it.type_id AS item_type,
               iv.variant_id,
               iv.variant_name,
               iv.variant_code,
               sh.quantity,
               sh.previous_quantity,
               sh.new_quantity,
               sh.created_at
            FROM stock_history sh
            JOIN items i ON i.item_id = sh.item_id
            JOIN item_types it ON it.type_id = i.type_id
            LEFT JOIN item_variants iv ON iv.variant_id = sh.variant_id
            ${whereSql}
            ORDER BY ${orderBy} ${sortDirection.toUpperCase()}
            LIMIT ? OFFSET ?
         `
         )
         .all(...values, limit, offset);

      /* Count */
      const total = db
         .prepare(
            `
            SELECT COUNT(*) as total
            FROM stock_history sh
            JOIN items i ON i.item_id = sh.item_id
            JOIN item_types it ON it.type_id = i.type_id
            LEFT JOIN item_variants iv ON iv.variant_id = sh.variant_id
            ${whereSql}
         `
         )
         .get(...values) as { total: number };

      return {
         data,
         total: total.total,
      };
   },

   createTransaction(params: CreateTransactionParams) {
      const db = getDb();

      const { type, itemId, variantId = null, quantity } = params;

      const trx = db.transaction(() => {
         // Lấy số lượng hiện tại
         const current = db
            .prepare(
               `
                  SELECT total_quantity
                  FROM items
                  WHERE item_id = ?
               `
            )
            .get(itemId) as { total_quantity: number } | 0;

         if (!current) {
            throw new Error('Item không tồn tại');
         }

         const previousQty = current.total_quantity;
         let newQty = previousQty;

         // Tính toán theo loại transaction
         switch (type) {
            case 'create':
               newQty = previousQty;
               break;
            case 'in':
               newQty = previousQty + quantity;
               break;

            case 'out':
               if (previousQty < quantity) {
                  throw new Error('Số lượng xuất vượt quá tồn kho');
               }
               newQty = previousQty - quantity;
               break;

            case 'delete':
               newQty = 0;
               break;

            default:
               throw new Error('Loại giao dịch không hợp lệ');
         }

         // Ghi stock_history
         db.prepare(
            `
            INSERT INTO stock_history (
               operation,
               item_id,
               variant_id,
               quantity,
               previous_quantity,
               new_quantity
            )
            VALUES (?, ?, ?, ?, ?, ?)
         `
         ).run(type, itemId, variantId, quantity, previousQty, newQty);

         return {
            itemId,
            previousQty,
            newQty,
         };
      });

      return trx();
   },

   getTodayNetFlow() {
      try {
         const db = getDb();
         const result = db
            .prepare(
               `
                  SELECT
                     SUM(CASE WHEN operation = 'in' THEN quantity ELSE 0 END) -
                     SUM(CASE WHEN operation = 'out' THEN quantity ELSE 0 END) as net_flow
                  FROM stock_history
                  WHERE DATE(created_at) = DATE('now')
               `
            )
            .get() as { net_flow: number | null };

         // Nếu không có giao dịch nào, result.net_flow sẽ là null, ta trả về 0
         return result?.net_flow ?? 0;
      } catch (error) {
         console.error('Lỗi tính toán luồng hàng hôm nay:', error);
         throw error;
      }
   },
};
