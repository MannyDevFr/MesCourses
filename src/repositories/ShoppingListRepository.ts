import { database } from '../database/database';
import type { ShoppingList } from '../models/ShoppingList';
import { validName } from '../utils/validation';
import { CategoryRepository } from './CategoryRepository';
import type { Category } from '../models/Catalog';
export const ShoppingListRepository = {
  async all() {
    return (await database()).getAllAsync<ShoppingList>(
      'SELECT * FROM shopping_lists ORDER BY createdAt DESC, id DESC',
    );
  },
  async create(value: string) {
    const name = validName(value, 200),
      createdAt = new Date().toISOString();
    let created!: ShoppingList;
    await (
      await database()
    ).withExclusiveTransactionAsync(async (tx) => {
      const category = await CategoryRepository.resolve(tx, name);
      const result = await tx.runAsync(
        'INSERT INTO shopping_lists(name,createdAt,category) VALUES (?,?,?)',
        name,
        createdAt,
        category,
      );
      await CategoryRepository.recordChoice(tx, category);
      created = { id: result.lastInsertRowId, name, createdAt, category };
    });
    return created;
  },
  async setCategory(id: number, category: Category) {
    await (
      await database()
    ).withExclusiveTransactionAsync(async (tx) => {
      const result = await tx.runAsync(
        'UPDATE shopping_lists SET category=? WHERE id=?',
        category,
        id,
      );
      if (!result.changes) throw new Error('List not found');
      await CategoryRepository.recordChoice(tx, category);
    });
  },
  async setCategoryByName(id: number, name: string) {
    await (
      await database()
    ).withExclusiveTransactionAsync(async (tx) => {
      const category = await CategoryRepository.resolve(tx, name);
      const result = await tx.runAsync(
        'UPDATE shopping_lists SET category=? WHERE id=?',
        category,
        id,
      );
      if (!result.changes) throw new Error('List not found');
      await CategoryRepository.recordChoice(tx, category);
    });
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
