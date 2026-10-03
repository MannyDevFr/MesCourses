import { create } from 'zustand';
import { getLocales } from 'expo-localization';
import type { ShoppingList } from '../models/ShoppingList';
import type { Product } from '../models/Product';
import { ShoppingListRepository as lists } from '../repositories/ShoppingListRepository';
import { ProductRepository as products } from '../repositories/ProductRepository';
import { SettingsRepository as settings } from '../repositories/SettingsRepository';
export type Language = 'en' | 'es' | 'fr';
interface State {
  lists: ShoppingList[];
  products: Product[];
  activeListId: number | null;
  ready: boolean;
  busy: boolean;
  error: boolean;
  language: Language;
  skipListDelete: boolean;
  skipProductDelete: boolean;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  openList: (id: number) => Promise<boolean>;
  createList: (name: string) => Promise<ShoppingList | undefined>;
  renameList: (id: number, name: string) => Promise<boolean>;
  deleteList: (id: number) => Promise<boolean>;
  addProduct: (name: string) => Promise<boolean>;
  renameProduct: (id: number, name: string) => Promise<boolean>;
  changeQuantity: (id: number, delta: number) => Promise<boolean>;
  toggleProduct: (id: number) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
  setLanguage: (language: Language) => Promise<boolean>;
  setSkipDelete: (kind: 'list' | 'product', value: boolean) => Promise<boolean>;
  clearError: () => void;
}
const deviceLanguage = getLocales()[0]?.languageCode;
export const useShoppingListStore = create<State>((set, get) => {
  // Serialize actions through a single busy gate. UI state changes only after durable writes succeed.
  async function run(action: () => Promise<void>) {
    if (get().busy) return false;
    set({ busy: true, error: false });
    try {
      await action();
      return true;
    } catch {
      set({ error: true });
      return false;
    } finally {
      set({ busy: false });
    }
  }
  async function reloadProducts() {
    const id = get().activeListId;
    set({ products: id === null ? [] : await products.all(id) });
  }
  return {
    lists: [],
    products: [],
    activeListId: null,
    ready: false,
    busy: false,
    error: false,
    language:
      deviceLanguage === 'es' || deviceLanguage === 'fr'
        ? deviceLanguage
        : 'en',
    skipListDelete: false,
    skipProductDelete: false,
    initialize: async () => {
      await run(async () => {
        const preferences = await settings.all();
        const language = preferences.language;
        set({
          lists: await lists.all(),
          ready: true,
          ...(language === 'en' || language === 'es' || language === 'fr'
            ? { language }
            : {}),
          skipListDelete: preferences.skipListDelete === 'true',
          skipProductDelete: preferences.skipProductDelete === 'true',
        });
      });
    },
    refresh: async () => {
      await run(async () => {
        set({ lists: await lists.all() });
        await reloadProducts();
      });
    },
    openList: (id) =>
      run(async () => {
        const items = await products.all(id);
        set({ activeListId: id, products: items });
      }),
    createList: async (name) => {
      let created: ShoppingList | undefined;
      const success = await run(async () => {
        created = await lists.create(name);
        set({
          lists: await lists.all(),
          activeListId: created.id,
          products: [],
        });
      });
      return success ? created : undefined;
    },
    renameList: (id, name) =>
      run(async () => {
        await lists.rename(id, name);
        set({ lists: await lists.all() });
      }),
    deleteList: (id) =>
      run(async () => {
        await lists.remove(id);
        set({
          lists: await lists.all(),
          ...(get().activeListId === id
            ? { activeListId: null, products: [] }
            : {}),
        });
      }),
    addProduct: (name) =>
      run(async () => {
        const id = get().activeListId;
        if (id === null) throw new Error('No active list');
        await products.create(id, name);
        await reloadProducts();
      }),
    renameProduct: (id, name) =>
      run(async () => {
        await products.rename(id, name);
        await reloadProducts();
      }),
    changeQuantity: (id, delta) =>
      run(async () => {
        await products.changeQuantity(id, delta);
        await reloadProducts();
      }),
    toggleProduct: (id) =>
      run(async () => {
        await products.toggle(id);
        await reloadProducts();
      }),
    deleteProduct: (id) =>
      run(async () => {
        await products.remove(id);
        await reloadProducts();
      }),
    setLanguage: (language) =>
      run(async () => {
        await settings.set('language', language);
        set({ language });
      }),
    setSkipDelete: (kind, value) =>
      run(async () => {
        const key = kind === 'list' ? 'skipListDelete' : 'skipProductDelete';
        await settings.set(key, String(value));
        set({ [key]: value });
      }),
    clearError: () => set({ error: false }),
  };
});
