import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { testDatabase } from './helpers/sqlite';
import { migrate } from '../src/database/migrations';
import { initialSchema } from '../src/database/schema';
import { database } from '../src/database/database';
import { CatalogRepository } from '../src/repositories/CatalogRepository';
import { CategoryRepository } from '../src/repositories/CategoryRepository';
import { addCatalog } from '../src/database/migrations/catalog';
import { categorySuggestions } from '../src/utils/catalog';
import { ShoppingListRepository } from '../src/repositories/ShoppingListRepository';
import { ProductRepository } from '../src/repositories/ProductRepository';
import { normalizeProduct, productSuggestions } from '../src/utils/catalog';
import type { SQLiteDatabase } from 'expo-sqlite';

jest.mock('../src/database/database', () => ({ database: jest.fn() }));
let db: SQLiteDatabase;
beforeEach(() => {
  db = testDatabase();
  jest.mocked(database).mockResolvedValue(db);
});
afterEach(async () => {
  await db.closeAsync();
});

test('fresh install seeds 760 products across 40 categories exactly once', async () => {
  await migrate(db);
  await migrate(db);
  expect(
    await db.getAllAsync(
      'SELECT category,COUNT(*) AS count FROM catalog_products GROUP BY category ORDER BY category',
    ),
  ).toEqual(
    expect.arrayContaining([
      { category: 'bakery', count: 100 },
      { category: 'hardware', count: 100 },
      { category: 'pharmacy', count: 100 },
      { category: 'supermarket', count: 100 },
    ]),
  );
  expect(await CatalogRepository.general()).toHaveLength(760);
  expect(
    await db.getFirstAsync(
      'SELECT COUNT(DISTINCT category) AS count FROM catalog_products',
    ),
  ).toEqual({ count: 40 });
  expect(
    await db.getFirstAsync(
      'SELECT MIN(count) AS minimum FROM (SELECT COUNT(*) AS count FROM catalog_products GROUP BY category)',
    ),
  ).toEqual({ minimum: 10 });
  expect(await CatalogRepository.personal()).toEqual([]);
  expect(await CategoryRepository.general()).toHaveLength(40);
  expect(await CategoryRepository.personal()).toEqual([]);
});

test('version 2 upgrade preserves products, product history, list IDs and foreign keys', async () => {
  await db.execAsync(initialSchema);
  await db.execAsync('PRAGMA user_version=1');
  await addCatalog(db);
  await db.execAsync(
    "INSERT INTO shopping_lists(id,name,createdAt,category) VALUES (8,'Pharmacie','now','pharmacy'); INSERT INTO shopping_lists(id,name,createdAt) VALUES (20,'Deleted','now'); DELETE FROM shopping_lists WHERE id=20;",
  );
  await ProductRepository.create(8, 'Dentifrice');
  const before = await CatalogRepository.personal();
  await migrate(db);
  expect(await CatalogRepository.personal()).toEqual(before);
  expect((await ProductRepository.all(8))[0].name).toBe('Dentifrice');
  expect(await db.getFirstAsync('PRAGMA foreign_keys')).toEqual({
    foreign_keys: 1,
  });
  expect(await db.getAllAsync('PRAGMA foreign_key_check')).toEqual([]);
  expect((await CategoryRepository.personal())[0]).toMatchObject({
    id: 'pharmacy',
    useCount: 1,
  });
  const list = await ShoppingListRepository.create('Librairie');
  expect(list).toMatchObject({ id: 21, category: 'books' });
  await ShoppingListRepository.remove(8);
  expect(await ProductRepository.all(8)).toEqual([]);
});

test('category cache merges aliases, ranks choices and learns custom categories without inventing products', async () => {
  await migrate(db);
  const first = await ShoppingListRepository.create('Panadería');
  const second = await ShoppingListRepository.create('Boulangerie');
  expect(first.category).toBe('bakery');
  expect(second.category).toBe('bakery');
  const custom = await ShoppingListRepository.create('Maison été');
  const repeated = await ShoppingListRepository.create('MAISON ETE');
  expect(repeated.category).toBe(custom.category);
  const general = await CategoryRepository.general();
  const personal = await CategoryRepository.personal();
  expect(general).toHaveLength(40);
  expect(personal).toHaveLength(2);
  expect(personal.find((c) => c.id === custom.category)?.useCount).toBe(2);
  const suggestions = categorySuggestions(general, personal);
  expect(new Set(suggestions.map((c) => c.id)).size).toBe(41);
  expect(suggestions.slice(0, 2).map((c) => c.id)).toEqual(
    expect.arrayContaining(['bakery', custom.category]),
  );
  expect(
    productSuggestions(custom.category, await CatalogRepository.general(), []),
  ).toEqual([]);
  await ProductRepository.create(custom.id, 'Lampe du bureau');
  expect((await CatalogRepository.personal())[0]).toMatchObject({
    category: custom.category,
    name: 'Lampe du bureau',
  });
  await ShoppingListRepository.remove(custom.id);
  await ShoppingListRepository.remove(repeated.id);
  expect(
    (await CategoryRepository.personal()).find((c) => c.id === custom.category)
      ?.useCount,
  ).toBe(2);
});

test('failed category rebuild rolls back and restores foreign key enforcement', async () => {
  await db.execAsync(initialSchema);
  await db.execAsync(
    "PRAGMA user_version=1; INSERT INTO shopping_lists(name,createdAt) VALUES ('Courses','now'); INSERT INTO products(listId,name,sortOrder) VALUES (1,'Lait',1);",
  );
  await addCatalog(db);
  const original = db.execAsync.bind(db);
  const exec = jest.spyOn(db, 'execAsync').mockImplementation(async (sql) => {
    if (sql.includes('CREATE TABLE shopping_lists_new'))
      throw new Error('Simulated migration failure');
    await original(sql);
  });
  await expect(migrate(db)).rejects.toThrow('Simulated migration failure');
  exec.mockRestore();
  expect(await db.getFirstAsync('PRAGMA user_version')).toEqual({
    user_version: 2,
  });
  expect(await db.getFirstAsync('PRAGMA foreign_keys')).toEqual({
    foreign_keys: 1,
  });
  expect((await ProductRepository.all(1))[0].name).toBe('Lait');
  expect(
    await db.getFirstAsync(
      "SELECT name FROM sqlite_master WHERE name='category_catalog'",
    ),
  ).toBeUndefined();
  expect(await CatalogRepository.general()).toHaveLength(400);
  await migrate(db);
  expect(await CatalogRepository.general()).toHaveLength(760);
});

test('invalid category assignment is rolled back without learning a selection', async () => {
  await migrate(db);
  const list = await ShoppingListRepository.create('Supermercado');
  const before = await CategoryRepository.personal();
  await expect(
    ShoppingListRepository.setCategory(list.id, 'not-a-category'),
  ).rejects.toThrow();
  expect((await ShoppingListRepository.all())[0].category).toBe('supermarket');
  expect(await CategoryRepository.personal()).toEqual(before);
  await expect(
    ShoppingListRepository.setCategoryByName(999, 'Never saved'),
  ).rejects.toThrow();
  expect(
    await db.getFirstAsync(
      "SELECT id FROM category_catalog WHERE normalizedName='never saved'",
    ),
  ).toBeUndefined();
});

test('version 1 upgrade preserves products/preferences and imports personal choices by category', async () => {
  await db.execAsync(initialSchema);
  await db.execAsync(
    "PRAGMA user_version=1; INSERT INTO shopping_lists(name,createdAt) VALUES ('Panadería','now'); INSERT INTO products(listId,name,quantity,isChecked,sortOrder) VALUES (1,'Croissant',3,1,1); INSERT INTO settings(key,value) VALUES ('language','es');",
  );
  await migrate(db);
  expect((await ShoppingListRepository.all())[0]).toMatchObject({
    name: 'Panadería',
    category: 'bakery',
  });
  expect((await ProductRepository.all(1))[0]).toMatchObject({
    name: 'Croissant',
    quantity: 3,
    isChecked: true,
  });
  expect(
    await db.getFirstAsync("SELECT value FROM settings WHERE key='language'"),
  ).toEqual({ value: 'es' });
  expect((await CatalogRepository.personal())[0]).toMatchObject({
    category: 'bakery',
    name: 'Croissant',
    useCount: 1,
  });
  await migrate(db);
  expect((await CatalogRepository.personal())[0].useCount).toBe(1);
});

test('personal cache learns custom entries, merges accents/case and ranks by frequency without crossing categories', async () => {
  await migrate(db);
  const list = await ShoppingListRepository.create('Supermercado');
  await ProductRepository.create(list.id, '  Café  ');
  await ProductRepository.create(list.id, 'cafe');
  await ProductRepository.create(list.id, 'Ma marque préférée');
  const general = await CatalogRepository.general();
  const personal = await CatalogRepository.personal();
  expect(personal).toHaveLength(2);
  expect(personal[0]).toMatchObject({ normalizedName: 'cafe', useCount: 2 });
  const suggested = productSuggestions('supermarket', general, personal);
  expect(suggested.slice(0, 2)).toEqual(['cafe', 'Ma marque préférée']);
  expect(suggested.filter((n) => normalizeProduct(n) === 'cafe')).toHaveLength(
    1,
  );
  expect(productSuggestions('hardware', general, personal)).not.toContain(
    'Ma marque préférée',
  );
  await ShoppingListRepository.setCategory(list.id, 'hardware');
  await ProductRepository.create(list.id, 'Café');
  expect(
    (await CatalogRepository.personal()).filter(
      (p) => p.normalizedName === 'cafe',
    ),
  ).toHaveLength(2);
  await ShoppingListRepository.remove(list.id);
  expect(await CatalogRepository.personal()).toHaveLength(3);
  expect(await CatalogRepository.general()).toHaveLength(760);
});

test('a failed cache write rolls back the product too', async () => {
  await migrate(db);
  const list = await ShoppingListRepository.create('Boulangerie');
  await db.execAsync(
    "CREATE TRIGGER reject_cache BEFORE INSERT ON personal_product_cache BEGIN SELECT RAISE(ABORT,'cache unavailable'); END;",
  );
  await expect(
    ProductRepository.create(list.id, 'Croissant'),
  ).rejects.toThrow();
  expect(await ProductRepository.all(list.id)).toEqual([]);
  expect(await CatalogRepository.personal()).toEqual([]);
});

test('both caches and the selected category survive reopening the database', async () => {
  const folder = mkdtempSync(join(tmpdir(), 'mescourses-catalog-'));
  await db.closeAsync();
  db = testDatabase(join(folder, 'catalog.db'));
  jest.mocked(database).mockResolvedValue(db);
  try {
    await migrate(db);
    const list = await ShoppingListRepository.create('Samedi');
    await ShoppingListRepository.setCategory(list.id, 'pharmacy');
    await ProductRepository.create(list.id, 'Savon surgras');
    await db.closeAsync();
    db = testDatabase(join(folder, 'catalog.db'));
    jest.mocked(database).mockResolvedValue(db);
    await migrate(db);
    expect((await ShoppingListRepository.all())[0].category).toBe('pharmacy');
    expect(await CategoryRepository.general()).toHaveLength(40);
    expect(
      (await CategoryRepository.personal()).find((c) => c.id === 'pharmacy'),
    ).toMatchObject({ useCount: 1 });
    expect(await CatalogRepository.general()).toHaveLength(760);
    expect((await CatalogRepository.personal())[0]).toMatchObject({
      name: 'Savon surgras',
      category: 'pharmacy',
      useCount: 1,
    });
  } finally {
    await db.closeAsync();
    db = testDatabase();
    rmSync(folder, { recursive: true, force: true });
  }
});
