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
   unit TEXT NOT NULL,
   total_quantity INTEGER NOT NULL DEFAULT 0,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

   FOREIGN KEY (type_id) REFERENCES item_types(type_id)
);

CREATE TABLE item_variants (
   variant_id INTEGER PRIMARY KEY AUTOINCREMENT,
   item_id INTEGER NOT NULL,
   variant_name TEXT NOT NULL,
   variant_code TEXT NOT NULL,
   quantity INTEGER NOT NULL DEFAULT 0,

   FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

CREATE INDEX idx_items_type_id ON items (type_id); -- WHERE type_id = ?

CREATE INDEX idx_items_item_name ON items (item_name); -- WHERE item_name LIKE 'Dép%'

CREATE INDEX idx_items_type_name ON items (type_id, item_name);
-- WHERE type_id = ?
-- WHERE type_id = ? AND item_name LIKE ?

CREATE INDEX idx_variants_item_id ON item_variants (item_id); -- WHERE item_id = ?

CREATE INDEX idx_variants_item_code ON item_variants (item_id, variant_code);
-- WHERE item_id = ?
-- WHERE item_id = ? AND variant_code = ?

CREATE UNIQUE INDEX uq_variants_item_variant_code ON item_variants (item_id, variant_code);
