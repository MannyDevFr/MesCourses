import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

export function testDatabase(file = ':memory:'): SQLiteDatabase {
  const sqlite = new DatabaseSync(file);
  const adapter = {
    execAsync: async (sql: string) => sqlite.exec(sql),
    getFirstAsync: async (sql: string, ...params: SQLInputValue[]) =>
      sqlite.prepare(sql).get(...params),
    getAllAsync: async (sql: string, ...params: SQLInputValue[]) =>
      sqlite.prepare(sql).all(...params),
    runAsync: async (sql: string, ...params: SQLInputValue[]) => {
      const result = sqlite.prepare(sql).run(...params);
      return {
        lastInsertRowId: Number(result.lastInsertRowid),
        changes: Number(result.changes),
      };
    },
    withExclusiveTransactionAsync: async (
      action: (tx: unknown) => Promise<void>,
    ) => {
      sqlite.exec('BEGIN');
      try {
        await action(adapter);
        sqlite.exec('COMMIT');
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },
    closeAsync: async () => sqlite.close(),
  };
  return adapter as unknown as SQLiteDatabase;
}
