# Catalogue France and personal suggestions

SQLite migration 2 adds two independent, persistent tables:

- `catalog_products`: 760 generic French names: 100 each for supermarket, bakery,
  pharmacy/parapharmacy and hardware, plus 10 starter products in each of 36 additional
  retail categories. Seeded from `src/database/catalogSeed.ts` (migration 2) and
  `src/database/additionalProductSeed.ts` (migration 4).
  This is the curated catalogue agreed in the conversation, not a verified sales ranking.
- `personal_product_cache`: names actually added by the user, their selection count
  and last-used timestamp, separately for each category. Custom names are included.

A product insertion and its personal-cache update share one transaction. Cancelled
or failed additions do not train the cache. The count measures additions, not product
quantity or purchased status. Existing products populate the personal cache during
upgrade without changing lists, quantities, purchase status or settings.

Suggestions put personal entries first (frequency, then recency), followed by the
general catalogue. Normalization merges case, accents, repeated whitespace and French
ligatures within each category. The latest selected spelling is displayed.
The focused entry field shows a compact selector with up to four matches and a custom
text option. Exact/prefix matches come first, with personal ordering retained for ties.
Enter or Add saves the highlighted option; available arrow-key events move selection,
and tapping a row remains optional. An unmatched name is saved as typed. Typing searches
the full category without accents. Successful entry clears the prefix and retains focus
and the keyboard for the next product. The selector closes when the field loses focus.

Every list has a persistent category. Migration 3 introduces `category_catalog` with
40 general categories and `personal_category_cache` with usage counts and timestamps.
These retail categories are a practical adaptation of [INSEE retail families](https://www.insee.fr/fr/metadonnees/naf2025/division/47), not a popularity ranking or an exact NAF classification.

Creating a list from a known category resolves it by name. Spanish and English aliases
of the original four categories retain their existing IDs. A custom name creates a
personal category without adding it to the general catalogue. Case/accent variants
resolve to the same category. The category button in detail opens the same searchable
selector and supports custom categories. Renaming a list does not change its category.
Changing category does not move old personal history between categories.

The list-creation selector shows personal categories first, then the general catalogue;
the initial four-category order is supermarket, bakery, pharmacy, hardware. Choosing a
category when creating a list or changing its category records one use atomically.
Deleting a list retains category history. Preloaded categories are list templates,
not automatically created empty shopping lists. Custom categories learn their products
from the user. Migration 3 preserves existing list IDs and the AUTOINCREMENT sequence,
product history, foreign keys and cascade deletion while removing the four-category limit.

The personal cache survives product/list deletion, category changes and restarts.
Both caches remain local to this app installation, with no network, account or expiry.
Interface labels follow the app language; catalogue names stay French for this region.

Research basis for the curated families:

- [FranceAgriMer — vegetables](https://www.franceagrimer.fr/sites/default/files/2026-02/04_FICHE_FILIERE_LEGUMES_2026.pdf)
- [CNIEL — dairy, 2025 edition](https://www.cniel.com/sites/default/files/2025-06/L%27%C3%A9conomie%20laiti%C3%A8re%20en%20chiffres%20-%20Edition%202025_0.pdf)
- [CNBPF — bakery](https://boulangerie.org/economie/)
- [FEB — bakery families](https://www.entrepreneursboulangerie.org/federation/)
- [Pharma GDD — product families](https://www.pharma-gdd.com/fr/catalog)
- [Leroy Merlin — product families](https://www.leroymerlin.fr/produits/)
- [Carrefour — fresh produce](https://www.carrefour.fr/r/fruits-et-legumes?page=1)
- [Fnac — retail families](https://www.fnac.com/index/p/)
- [Truffaut — pets](https://www.truffaut.com/animalerie/chiens.html)
- [Mondial Tissus — haberdashery](https://www.mondialtissus.fr/materiel-de-couture.html)
- [Sephora — beauty](https://www.sephora.fr/)

Validation covers fresh install, version-1 upgrade, idempotent seeding, normalization,
category isolation, custom entries, ranking, transaction rollback, cache survival after
list deletion and closing/reopening a real SQLite file, plus suggestion filtering in UI.
