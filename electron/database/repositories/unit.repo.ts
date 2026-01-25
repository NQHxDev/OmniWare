import { getDb } from '..';

export const UnitRepository = {
   getAll: () => {
      const db = getDb();
      const rows = db.prepare('SELECT * FROM units ORDER BY unit_id ASC').all();
      return rows;
   },

   // Lấy một đơn vị theo ID
   getById: (id: number) => {
      const db = getDb();
      return db.prepare('SELECT * FROM units WHERE unit_id = ?').get(id);
   },

   // Cập nhật Slug hoặc Tên
   update: (id: number, slug: string, name: string) => {
      const db = getDb();
      return db
         .prepare('UPDATE units SET unit_slug = ?, unit_name = ? WHERE unit_id = ?')
         .run(slug, name, id);
   },
};
