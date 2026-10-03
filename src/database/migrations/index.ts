import type { SQLiteDatabase } from 'expo-sqlite';
import { initialSchema } from '../schema';
export async function migrate(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const row = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version',
  );
  if ((row?.user_version ?? 0) > 1)
    throw new Error('Unsupported database version');
  if (!row?.user_version) {
    await db.withExclusiveTransactionAsync(async (tx) => {
      await tx.execAsync(initialSchema);
      await tx.execAsync('PRAGMA user_version = 1');
    });
  }
}
