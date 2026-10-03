import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { migrate } from './migrations';
let connection: Promise<SQLiteDatabase> | undefined;
export function database() {
  if (!connection)
    connection = (async () => {
      const db = await openDatabaseAsync('mescourses.db');
      try {
        await migrate(db);
        return db;
      } catch (error) {
        await db.closeAsync();
        connection = undefined;
        throw error;
      }
    })();
  return connection;
}
