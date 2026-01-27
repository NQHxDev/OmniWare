CREATE TABLE units (
   unit_id INTEGER PRIMARY KEY AUTOINCREMENT,
   unit_slug TEXT NOT NULL UNIQUE,
   unit_name TEXT NOT NULL UNIQUE
);

INSERT INTO units (unit_slug, unit_name) VALUES
   ('pair', 'Đôi'),
   ('unit', 'Cái'),
   ('carton', 'Thùng'),
   ('roll', 'Cuộn'),
   ('box', 'Hộp'),
   ('bag', 'Túi'),
   ('kg', 'Kilogram'),
   ('ton', 'Tấn'),
   ('liter', 'Lít'),
   ('meter', 'Mét'),
   ('m2', 'Mét vuông');

CREATE TABLE item_types (
   type_id INTEGER PRIMARY KEY AUTOINCREMENT,
   type_code TEXT NOT NULL UNIQUE,   -- product, material, raw
   type_name TEXT NOT NULL            -- Sản phẩm, Nguyên vật liệu, Nguyên liệu thô
);

INSERT INTO item_types (type_code, type_name) VALUES
   ('product', 'Sản phẩm'),
   ('material', 'Nguyên vật liệu'),
   ('raw', 'Nguyên liệu thô');

CREATE TABLE items (
   item_id INTEGER PRIMARY KEY AUTOINCREMENT,
   item_name TEXT NOT NULL,
   item_code TEXT NOT NULL UNIQUE,
   type_id INTEGER NOT NULL,
   unit_id INTEGER NOT NULL,
   total_quantity INTEGER NOT NULL DEFAULT 0,
   low_stock_threshold INTEGER NOT NULL DEFAULT -1,
   is_low_stock INTEGER GENERATED ALWAYS AS (CASE WHEN low_stock_threshold >= 0 AND total_quantity <= low_stock_threshold THEN 1 ELSE 0 END) VIRTUAL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

   FOREIGN KEY (type_id) REFERENCES item_types(type_id),
   FOREIGN KEY (unit_id) REFERENCES units(unit_id)
);

CREATE TABLE item_variants (
   variant_id INTEGER PRIMARY KEY AUTOINCREMENT,
   item_id INTEGER NOT NULL,
   variant_name TEXT NOT NULL,
   variant_code TEXT NOT NULL,
   quantity INTEGER NOT NULL DEFAULT 0,

   FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

CREATE TABLE stock_history (
   history_id INTEGER PRIMARY KEY AUTOINCREMENT,
   item_id INTEGER NOT NULL,
   variant_id INTEGER NOT NULL,
   operation TEXT NOT NULL CHECK (operation IN ('create', 'in', 'out', 'delete')),
   quantity INTEGER NOT NULL DEFAULT 0,
   previous_quantity INTEGER NOT NULL DEFAULT 0,
   new_quantity INTEGER NOT NULL DEFAULT 0,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

   FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
   FOREIGN KEY (variant_id) REFERENCES item_variants(variant_id) ON DELETE CASCADE
);

CREATE INDEX idx_items_type_id ON items (type_id); -- WHERE type_id = ?

CREATE INDEX idx_items_item_name ON items (item_name); -- WHERE item_name LIKE 'Dép%'

CREATE INDEX idx_items_type_name ON items (type_id, item_name);
-- WHERE type_id = ?
-- WHERE type_id = ? AND item_name LIKE ?

CREATE INDEX idx_items_stock_alert ON items (low_stock_threshold, total_quantity);
-- WHERE low_stock_threshold >= 0 AND total_quantity <= low_stock_threshold

CREATE INDEX idx_items_low_stock_status ON items (is_low_stock);

CREATE INDEX idx_variants_item_id ON item_variants (item_id); -- WHERE item_id = ?

CREATE INDEX idx_variants_item_code ON item_variants (item_id, variant_code);
-- WHERE item_id = ?
-- WHERE item_id = ? AND variant_code = ?

CREATE UNIQUE INDEX uq_variants_item_variant_code ON item_variants (item_id, variant_code);

CREATE INDEX idx_stock_history_item_variant ON stock_history (item_id, variant_id, created_at);
-- WHERE item_id = ?
-- WHERE item_id = ? AND variant_id = ?
-- WHERE item_id = ? AND variant_id = ? ORDER BY created_at DES

CREATE INDEX idx_stock_history_operation_date ON stock_history (operation, created_at);
-- WHERE operation = 'in'
-- WHERE operation = 'out' AND created_at >= '2026-01-01'

CREATE INDEX idx_stock_history_variant_id ON stock_history (variant_id);
