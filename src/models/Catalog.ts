export const categories = [
  'supermarket',
  'bakery',
  'pharmacy',
  'hardware',
] as const;
export type Category = string;

export interface CatalogCategory {
  id: Category;
  name: string;
  normalizedName: string;
}
export interface PersonalCategory extends CatalogCategory {
  useCount: number;
  lastUsedAt: string;
}

export interface CatalogProduct {
  category: Category;
  name: string;
  normalizedName: string;
}
export interface PersonalProduct extends CatalogProduct {
  useCount: number;
  lastUsedAt: string;
}
