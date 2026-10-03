# Validation — 2026-10-04

## Automated checks

- `npm run check`: ESLint, strict TypeScript and 8 tests across 3 suites pass.
- `npx expo-doctor`: 21/21 checks pass.
- Android Metro export succeeds.
- SQLite schema tests use a real database, close/reopen it, and verify constraints, cascade deletion and purchase ordering.
- Store integration tests exercise migrations, repositories, preferences and shopping actions.
- Component tests cover adding, quantity controls, double-tap editing, blank-name validation and failed/cancelled deletion.

## Android runtime

Standalone release APK tested on Pixel 5 emulator, Android 14 / API 34 (x86_64).
The build includes arm64-v8a for 64-bit phones as well as x86_64 for the emulator.

Verified using ADB UI hierarchy and inspected screenshots:

- Create a suggested list, open its detail and add suggested products.
- Increase quantity from 1 to 2; mark purchased; purchased item moves after pending items and is struck through.
- Choose Spanish, disable emulator Wi-Fi/mobile data, force-stop and launch again.
- Open the saved list offline; quantity, purchase status and language survive restart.
- Long-press a product, rename with the Android keyboard and save.
- Cancel deletion and retain the product; confirm deletion and remove it.
- Navigate back using the header arrow.
- Android hardware Back returns from detail to lists; predictive back animations are disabled for the standard navigation stack.
- Disable only product deletion confirmations, restart offline, and verify that the product setting persists while list confirmations stay enabled; restore it afterward.

Screenshots: [lists](screenshots/lists.png), [products](screenshots/products.png), [settings](screenshots/settings.png).

## Remaining validation before distribution

Test ergonomics and accessibility on the intended physical phone, especially large font sizes and the keyboard.
This is a locally signed test APK: configure private release signing before store publication.
Review unresolved dependency advisories in [dependency-audit.json](dependency-audit.json).
MAUI data import and voice/AI/OCR/cloud are outside this first implementation.
