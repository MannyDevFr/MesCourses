import { database } from '../database/database';
export const SettingsRepository = {
  async all() {
    const rows = await (
      await database()
    ).getAllAsync<{ key: string; value: string }>('SELECT * FROM settings');
    return Object.fromEntries(rows.map((row) => [row.key, row.value]));
  },
  async set(key: string, value: string) {
    await (
      await database()
    ).runAsync(
      'INSERT INTO settings(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
      key,
      value,
    );
  },
};
