import type { SQLiteDatabase } from 'expo-sqlite';
import { categorySeed } from '../categorySeed';
import { normalizeProduct } from '../../utils/catalog';

export async function addCategories(db: SQLiteDatabase) {
  // Startup owns this connection. Rebuild on the same connection so foreign_keys
  // can be disabled outside the transaction, as required by SQLite's migration procedure.
  await db.execAsync('PRAGMA foreign_keys=OFF');
  try {
    await db.execAsync('BEGIN EXCLUSIVE');
    try {
      const sequence = await db.getFirstAsync<{ seq: number }>(
        "SELECT seq FROM sqlite_sequence WHERE name='shopping_lists'",
      );
      await db.execAsync(`
        CREATE TABLE category_catalog (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 200),
          normalizedName TEXT NOT NULL UNIQUE,
          sortOrder INTEGER NOT NULL,
          isCustom INTEGER NOT NULL DEFAULT 0 CHECK(isCustom IN (0,1))
        );
        CREATE TABLE personal_category_cache (
          categoryId TEXT PRIMARY KEY NOT NULL REFERENCES category_catalog(id),
          useCount INTEGER NOT NULL CHECK(useCount>=1),
          lastUsedAt TEXT NOT NULL
        );
      `);
      for (const [sortOrder, [id, name]] of categorySeed.entries()) {
        await db.runAsync(
          'INSERT INTO category_catalog(id,name,normalizedName,sortOrder) VALUES (?,?,?,?)',
          id,
          name,
          normalizeProduct(name),
          sortOrder,
        );
      }
      await db.execAsync(`
        CREATE TABLE shopping_lists_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 200),
          createdAt TEXT NOT NULL,
          category TEXT NOT NULL DEFAULT 'supermarket' REFERENCES category_catalog(id)
        );
        INSERT INTO shopping_lists_new SELECT id,name,createdAt,category FROM shopping_lists;
        DROP TABLE shopping_lists;
        ALTER TABLE shopping_lists_new RENAME TO shopping_lists;
        CREATE TABLE catalog_products_new (
          category TEXT NOT NULL REFERENCES category_catalog(id),
          normalizedName TEXT NOT NULL,
          name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 300),
          sortOrder INTEGER NOT NULL,
          PRIMARY KEY(category,normalizedName)
        );
        INSERT INTO catalog_products_new SELECT * FROM catalog_products;
        DROP TABLE catalog_products;
        ALTER TABLE catalog_products_new RENAME TO catalog_products;
        CREATE TABLE personal_product_cache_new (
          category TEXT NOT NULL REFERENCES category_catalog(id),
          normalizedName TEXT NOT NULL,
          name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 300),
          useCount INTEGER NOT NULL CHECK(useCount>=1),
          lastUsedAt TEXT NOT NULL,
          PRIMARY KEY(category,normalizedName)
        );
        INSERT INTO personal_product_cache_new SELECT * FROM personal_product_cache;
        DROP TABLE personal_product_cache;
        ALTER TABLE personal_product_cache_new RENAME TO personal_product_cache;
      `);
      if (sequence) {
        await db.runAsync(
          "UPDATE sqlite_sequence SET seq=MAX(seq,?) WHERE name='shopping_lists'",
          sequence.seq,
        );
        await db.runAsync(
          "INSERT INTO sqlite_sequence(name,seq) SELECT 'shopping_lists',? WHERE NOT EXISTS(SELECT 1 FROM sqlite_sequence WHERE name='shopping_lists')",
          sequence.seq,
        );
      }
      await db.runAsync(
        `INSERT INTO personal_category_cache(categoryId,useCount,lastUsedAt)
        SELECT category,COUNT(*),? FROM shopping_lists GROUP BY category`,
        new Date().toISOString(),
      );
      if ((await db.getAllAsync('PRAGMA foreign_key_check')).length)
        throw new Error('Category migration violates foreign keys');
      await db.execAsync('PRAGMA user_version=3; COMMIT');
    } catch (error) {
      await db.execAsync('ROLLBACK');
      throw error;
    }
  } finally {
    await db.execAsync('PRAGMA foreign_keys=ON');
  }
}
