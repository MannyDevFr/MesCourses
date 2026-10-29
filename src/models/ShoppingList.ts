import type { Category } from './Catalog';
export interface ShoppingList {
  id: number;
  name: string;
  createdAt: string;
  category: Category;
}
