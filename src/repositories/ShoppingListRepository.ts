import { database } from '../database/database';
import type { ShoppingList } from '../models/ShoppingList';
import { validName } from '../utils/validation';
export const ShoppingListRepository = {
  async all() {
    return (await database()).getAllAsync<ShoppingList>(
      'SELECT * FROM shopping_lists ORDER BY createdAt DESC, id DESC',
    );
  },
  async create(value: string) {
    const name = validName(value, 200),
      createdAt = new Date().toISOString();
    const result = await (
      await database()
    ).runAsync(
      'INSERT INTO shopping_lists(name,createdAt) VALUES (?,?)',
      name,
      createdAt,
    );
    return { id: result.lastInsertRowId, name, createdAt };
  },
  async rename(id: number, value: string) {
    await (
      await database()
    ).runAsync(
      'UPDATE shopping_lists SET name=? WHERE id=?',
      validName(value, 200),
      id,
    );
  },
  async remove(id: number) {
    await (
      await database()
    ).runAsync('DELETE FROM shopping_lists WHERE id=?', id);
  },
};
