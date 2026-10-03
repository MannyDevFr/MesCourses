import { database } from '../database/database';
import type { Product } from '../models/Product';
import { validName } from '../utils/validation';
type ProductRow = Omit<Product, 'isChecked'> & { isChecked: number };
export const ProductRepository = {
  async all(listId: number): Promise<Product[]> {
    const rows = await (
      await database()
    ).getAllAsync<ProductRow>(
      'SELECT * FROM products WHERE listId=? ORDER BY isChecked, id',
      listId,
    );
    return rows.map((row) => ({ ...row, isChecked: !!row.isChecked }));
  },
  async create(listId: number, value: string) {
    await (
      await database()
    ).runAsync(
      'INSERT INTO products(listId,name,sortOrder) VALUES (?,?,(SELECT COALESCE(MAX(sortOrder),0)+1 FROM products WHERE listId=?))',
      listId,
      validName(value, 300),
      listId,
    );
  },
  async rename(id: number, value: string) {
    await (
      await database()
    ).runAsync(
      'UPDATE products SET name=? WHERE id=?',
      validName(value, 300),
      id,
    );
  },
  async changeQuantity(id: number, delta: number) {
    await (
      await database()
    ).runAsync(
      'UPDATE products SET quantity=MAX(1,quantity+?) WHERE id=?',
      delta,
      id,
    );
  },
  async toggle(id: number) {
    await (
      await database()
    ).runAsync('UPDATE products SET isChecked=1-isChecked WHERE id=?', id);
  },
  async remove(id: number) {
    await (await database()).runAsync('DELETE FROM products WHERE id=?', id);
  },
};
