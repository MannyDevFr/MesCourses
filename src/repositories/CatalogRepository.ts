import { database } from '../database/database';
import type { CatalogProduct, PersonalProduct } from '../models/Catalog';

export const CatalogRepository = {
  async general() {
    return (await database()).getAllAsync<CatalogProduct>(
      'SELECT category,name,normalizedName FROM catalog_products ORDER BY category,sortOrder',
    );
  },
  async personal() {
    return (await database()).getAllAsync<PersonalProduct>(
      'SELECT category,name,normalizedName,useCount,lastUsedAt FROM personal_product_cache ORDER BY useCount DESC,lastUsedAt DESC,normalizedName',
    );
  },
};
