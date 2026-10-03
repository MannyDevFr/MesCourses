import { useShoppingListStore } from '../src/stores/shoppingListStore';
import { ProductRepository } from '../src/repositories/ProductRepository';
import { database } from '../src/database/database';
jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'es' }],
}));
jest.mock('expo-sqlite', () => {
  // Load the native adapter inside Jest's hoisted factory.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { DatabaseSync } = require('node:sqlite');
  const sqlite = new DatabaseSync(':memory:');
  const adapter = {
    execAsync: async (sql: string) => sqlite.exec(sql),
    getFirstAsync: async (sql: string, ...params: unknown[]) =>
      sqlite.prepare(sql).get(...params),
    getAllAsync: async (sql: string, ...params: unknown[]) =>
      sqlite.prepare(sql).all(...params),
    runAsync: async (sql: string, ...params: unknown[]) => {
      const r = sqlite.prepare(sql).run(...params);
      return {
        lastInsertRowId: Number(r.lastInsertRowid),
        changes: Number(r.changes),
      };
    },
    withExclusiveTransactionAsync: async (
      action: (tx: unknown) => Promise<void>,
    ) => {
      sqlite.exec('BEGIN');
      try {
        await action(adapter);
        sqlite.exec('COMMIT');
      } catch (e) {
        sqlite.exec('ROLLBACK');
        throw e;
      }
    },
    closeAsync: async () => sqlite.close(),
  };
  return { openDatabaseAsync: async () => adapter };
});

test('complete offline shopping flow uses repositories, migrates once and restores settings', async () => {
  const store = () => useShoppingListStore.getState();
  await store().initialize();
  expect(store().ready).toBe(true);
  expect(store().language).toBe('es');
  const list = await store().createList('  Market  ');
  expect(list?.name).toBe('Market');
  expect(await store().addProduct('  Milk  ')).toBe(true);
  expect(await store().addProduct('Bread')).toBe(true);
  const milk = store().products.find((p) => p.name === 'Milk')!;
  await store().changeQuantity(milk.id, -1);
  expect(store().products[0].quantity).toBe(1);
  await store().changeQuantity(milk.id, 1);
  await store().toggleProduct(milk.id);
  expect(store().products.map((p) => p.name)).toEqual(['Bread', 'Milk']);
  expect(store().products[1]).toMatchObject({ quantity: 2, isChecked: true });
  await store().renameProduct(milk.id, '  Oat milk ');
  expect(store().products[1].name).toBe('Oat milk');
  await store().renameList(list!.id, ' Weekly ');
  expect(store().lists[0].name).toBe('Weekly');
  await store().setLanguage('fr');
  await store().setSkipDelete('product', true);
  useShoppingListStore.setState({
    ready: false,
    language: 'en',
    skipProductDelete: false,
    products: [],
  });
  await store().initialize();
  expect(store().language).toBe('fr');
  expect(store().skipProductDelete).toBe(true);
  await store().openList(list!.id);
  expect(store().products).toHaveLength(2);
  expect(await store().addProduct('   ')).toBe(false);
  expect(store().error).toBe(true);
  await store().deleteList(list!.id);
  expect(store().lists).toHaveLength(0);
  expect(store().activeListId).toBeNull();
  expect(await ProductRepository.all(list!.id)).toHaveLength(0);
  const db = await database();
  expect(await db.getFirstAsync('PRAGMA user_version')).toEqual({
    user_version: 1,
  });
});
