# MAUI → React Native

## Reference inventory

- Active screens: ListsPage and ListDetailPage. Shell stack navigation; list creation opens detail.
- Additional AddEditListPage and AddEditItemPage exist; item form has no current visible entry point.
- MainPage is unused template content (not a shopping screen).
- Lists: integer ID, name (200), UTC creation date. Products: integer ID, list ID, name (300), quantity, checked, sort order.
- Local SQLite shoplist.db3; separate Preferences for language and two skip-confirmation flags.
- CRUD, quick suggestions, trim names, quantity >=1, checked items last then ID, cascade list deletion.
- Loading, empty, editing, delete popup, selected delete target, language menu, confirmation preference states.
- Shared patterns: quick input, suggestion chips, white cards, inline editor, confirmation modal.
- Visual: light-only #F5F7FA, blue #1B3B5F, coral #FF7E5F, white surfaces, Open Sans, rounded cards.
- Assets: appicon.png is the actual app icon; splash.svg uses blue. dotnet_bot.png and MainPage are unused template artifacts.
- Gestures: keyboard Enter/plus adds, suggestion tap creates, double tap name edits, checkbox toggles purchase, quantity left/right changes, pull refresh, back, trash confirmation with optional persistent suppression.

## Target mapping and intentional refinements

ListsPage → ListsScreen; ListDetailPage → ShoppingListScreen; forms → EditNameDialog and AddProductInput;
Shell → native navigation stack; models → typed domain models; DataService → SQLite migrations and repositories;
ViewModels → Zustand actions and hooks; resources/preferences → typed translations and settings table;
XAML styles → tokens/components; registered app icon and fonts → Expo assets.

Lists open on a single name tap (delayed 300ms to distinguish double-tap editing) or immediately with the arrow button.
Names retain double-tap editing and add long-press/accessibility edit actions. Quantity controls are explicit 48dp buttons.
Settings adds language and the ability to restore delete confirmations. Creation and edits reject blank names consistently.
Purchased items retain strikethrough and move to the end. Suggestions remain fixed translated shortcuts, not AI.

## Architecture

Expo React Native + strict TypeScript, Expo Router native stack, Zustand, expo-sqlite.
SQLite is the durable source of truth. Parameterized writes, foreign keys, checks, versioned migrations and WAL.
Store actions gate concurrent writes, surface recoverable errors and reload after successful writes.
Component interaction state stays local. Data starts empty; no MAUI database import or cloud dependency.
Future service boundaries are documented without fake integrations or premature SDK dependencies.

## Validation boundaries

Typecheck and Android Metro export verify source/bundle. Component tests verify gestures/validation.
Database integration tests must run the actual migration SQL and verify cascade, ordering and durable reload.
Android runtime verification and APK compilation are separate from JS tests. Device ergonomics require final user feedback.
