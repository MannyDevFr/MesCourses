import type { SQLiteDatabase } from 'expo-sqlite';
import { additionalProductSeed } from '../additionalProductSeed';
import { normalizeProduct } from '../../utils/catalog';

export async function addAdditionalProducts(db: SQLiteDatabase) {
  await db.withExclusiveTransactionAsync(async (tx) => {
    for (const product of additionalProductSeed) {
      await tx.runAsync(
        'INSERT INTO catalog_products(category,normalizedName,name,sortOrder) VALUES (?,?,?,?) ON CONFLICT(category,normalizedName) DO NOTHING',
        product.category,
        normalizeProduct(product.name),
        product.name,
        product.sortOrder,
      );
    }
    await tx.execAsync('PRAGMA user_version=4');
  });
}
