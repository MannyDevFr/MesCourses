export const initialSchema = `
CREATE TABLE shopping_lists (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 200),
 createdAt TEXT NOT NULL
);
CREATE TABLE products (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 listId INTEGER NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
 name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 300),
 quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity >= 1),
 isChecked INTEGER NOT NULL DEFAULT 0 CHECK(isChecked IN (0,1)),
 sortOrder INTEGER NOT NULL
);
CREATE INDEX products_list ON products(listId);
CREATE TABLE settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
`;
