import type { SQLiteDatabase } from 'expo-sqlite';
import { database } from '../database/database';
import type { CatalogCategory, PersonalCategory } from '../models/Catalog';
import { normalizeProduct } from '../utils/catalog';
import { validName } from '../utils/validation';

const aliases: Record<string, string> = {
  supermercado: 'supermarket',
  supermarket: 'supermarket',
  supermarche: 'supermarket',
  panaderia: 'bakery',
  bakery: 'bakery',
  boulangerie: 'bakery',
  farmacia: 'pharmacy',
  pharmacy: 'pharmacy',
  pharmacie: 'pharmacy',
  ferreteria: 'hardware',
  'hardware store': 'hardware',
  bricolage: 'hardware',
  quincaillerie: 'hardware',
};

export const CategoryRepository = {
  async general() {
    return (await database()).getAllAsync<CatalogCategory>(
      'SELECT id,name,normalizedName FROM category_catalog WHERE isCustom=0 ORDER BY sortOrder,id',
    );
  },
  async personal() {
    return (await database())
      .getAllAsync<PersonalCategory>(`SELECT c.id,c.name,c.normalizedName,p.useCount,p.lastUsedAt
      FROM personal_category_cache p JOIN category_catalog c ON c.id=p.categoryId
      ORDER BY p.useCount DESC,p.lastUsedAt DESC,c.name`);
  },
  async resolve(tx: SQLiteDatabase, value: string) {
    const name = validName(value, 200);
    const key = normalizeProduct(name);
    if (Object.hasOwn(aliases, key)) return aliases[key];
    const existing = await tx.getFirstAsync<{ id: string }>(
      'SELECT id FROM category_catalog WHERE normalizedName=?',
      key,
    );
    if (existing) return existing.id;
    const id = `custom:${key}`;
    await tx.runAsync(
      'INSERT INTO category_catalog(id,name,normalizedName,sortOrder,isCustom) VALUES (?,?,?,1000,1)',
      id,
      name,
      key,
    );
    return id;
  },
  async recordChoice(tx: SQLiteDatabase, id: string) {
    await tx.runAsync(
      `INSERT INTO personal_category_cache(categoryId,useCount,lastUsedAt) VALUES (?,1,?)
      ON CONFLICT(categoryId) DO UPDATE SET useCount=useCount+1,lastUsedAt=excluded.lastUsedAt`,
      id,
      new Date().toISOString(),
    );
  },
};
