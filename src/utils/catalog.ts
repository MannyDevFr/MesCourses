import type {
  Category,
  CatalogProduct,
  PersonalProduct,
  CatalogCategory,
  PersonalCategory,
} from '../models/Catalog';

export function normalizeProduct(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/[’']/g, ' ')
    .replace(/\s+/g, ' ');
}

export function categoryForName(name: string): Category {
  const key = normalizeProduct(name);
  if (/boulanger|panader|bakery/.test(key)) return 'bakery';
  if (/pharmac|farmac/.test(key)) return 'pharmacy';
  if (/bricol|quincailler|ferreter|hardware/.test(key)) return 'hardware';
  return 'supermarket';
}

export function categorySuggestions(
  general: CatalogCategory[],
  personal: PersonalCategory[],
) {
  const preferred = [...personal].sort(
    (a, b) =>
      b.useCount - a.useCount ||
      b.lastUsedAt.localeCompare(a.lastUsedAt) ||
      a.name.localeCompare(b.name),
  );
  const seen = new Set<string>();
  return [...preferred, ...general].filter((category) => {
    if (seen.has(category.id)) return false;
    seen.add(category.id);
    return true;
  });
}

export function categoryLabel(
  category: CatalogCategory,
  translated: Record<string, string>,
) {
  return Object.hasOwn(translated, category.id)
    ? translated[category.id]
    : category.name;
}

// The personal cache takes precedence; normalized keys prevent duplicate suggestions.
export function productSuggestions(
  category: Category,
  general: CatalogProduct[],
  personal: PersonalProduct[],
) {
  const preferred = personal
    .filter((p) => p.category === category)
    .sort(
      (a, b) =>
        b.useCount - a.useCount ||
        b.lastUsedAt.localeCompare(a.lastUsedAt) ||
        a.name.localeCompare(b.name),
    );
  const seen = new Set<string>();
  return [...preferred, ...general.filter((p) => p.category === category)]
    .filter((p) => {
      if (seen.has(p.normalizedName)) return false;
      seen.add(p.normalizedName);
      return true;
    })
    .map((p) => p.name);
}
