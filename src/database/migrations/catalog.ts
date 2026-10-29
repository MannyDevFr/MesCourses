import type { SQLiteDatabase } from 'expo-sqlite';
import { catalogSeed } from '../catalogSeed';
import { categoryForName, normalizeProduct } from '../../utils/catalog';
import type { Category } from '../../models/Catalog';

export async function addCatalog(db: SQLiteDatabase) {
  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.execAsync(`
      ALTER TABLE shopping_lists ADD COLUMN category TEXT NOT NULL DEFAULT 'supermarket'
        CHECK(category IN ('supermarket','bakery','pharmacy','hardware'));
      CREATE TABLE catalog_products (
        category TEXT NOT NULL CHECK(category IN ('supermarket','bakery','pharmacy','hardware')),
        normalizedName TEXT NOT NULL,
        name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 300),
        sortOrder INTEGER NOT NULL,
        PRIMARY KEY(category,normalizedName)
      );
      CREATE TABLE personal_product_cache (
        category TEXT NOT NULL CHECK(category IN ('supermarket','bakery','pharmacy','hardware')),
        normalizedName TEXT NOT NULL,
        name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 300),
        useCount INTEGER NOT NULL CHECK(useCount >= 1),
        lastUsedAt TEXT NOT NULL,
        PRIMARY KEY(category,normalizedName)
      );
    `);
    for (const list of await tx.getAllAsync<{ id: number; name: string }>(
      'SELECT id,name FROM shopping_lists',
    )) {
      await tx.runAsync(
        'UPDATE shopping_lists SET category=? WHERE id=?',
        categoryForName(list.name),
        list.id,
      );
    }
    for (const product of catalogSeed) {
      await tx.runAsync(
        'INSERT INTO catalog_products(category,normalizedName,name,sortOrder) VALUES (?,?,?,?)',
        product.category,
        normalizeProduct(product.name),
        product.name,
        product.sortOrder,
      );
    }
    const now = new Date().toISOString();
    // Existing products are also user choices; do not start their personal cache empty.
    for (const product of await tx.getAllAsync<{
      category: Category;
      name: string;
    }>(
      'SELECT l.category,p.name FROM products p JOIN shopping_lists l ON l.id=p.listId ORDER BY p.id',
    )) {
      await tx.runAsync(
        `INSERT INTO personal_product_cache(category,normalizedName,name,useCount,lastUsedAt)
        VALUES (?,?,?,1,?) ON CONFLICT(category,normalizedName) DO UPDATE SET
        name=excluded.name,useCount=useCount+1,lastUsedAt=excluded.lastUsedAt`,
        product.category,
        normalizeProduct(product.name),
        product.name,
        now,
      );
    }
    await tx.execAsync('PRAGMA user_version = 2');
  });
}
