# MesCourses+ startup screen

Blue background (`#1B3B5F`), white shopping-cart emblem and coral plus (`#FF7E5F`).
The native launch screen uses the transparent emblem; the React loading screen adds
the wordmark, localized tagline and loading indicator. It preserves startup error
recovery and font fallback, and adds no artificial delay.

- Native configuration: `expo-splash-screen` config plugin in `app.json`.
- Native visibility is held at module load, then released after the first React layout.
- Native fade is 200 ms, disabled when the system requests reduced motion.
- React loading UI: `src/bootstrap/StartupScreen.tsx`.
- Asset source: `scripts/generate-splash.ps1`; output: `assets/splash-mark.png`.
- Design preview: `artifacts/splash-preview.png` (illustration, not a device capture).

Regenerate the assets on Windows:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/generate-splash.ps1
```

Installing a native module and changing splash plugin settings requires a new native
build. Use EAS for standalone Android builds. A new local development APK was compiled
and installed on the Pixel 5 emulator with the native splash module and resources.
The navy background and cart emblem were captured during a cold launcher start,
followed by successful loading of the shopping lists. This development APK needs Metro;
standalone release acceptance is still separate.

Build: `npm run android -- --emulator-only --no-bundler` after Expo prebuild.
Artifact: `artifacts/MesCourses-splash-dev.apk` (x86_64 emulator only).
Capture: `artifacts/splash-native-capture.png`.
SQLite table hashes before/after installation matched for lists, products, settings
and both personal histories. EAS account status on this machine was not logged in.

Expo specifically recommends verifying splash screens on a standalone release build:
[SDK 57 splash-screen documentation](https://docs.expo.dev/versions/v57.0.0/sdk/splash-screen/).
The Android system launch screen and the branded React loading screen are distinct;
Android may constrain the native emblem's placement and size.

Validation: lint, TypeScript, startup loading/retry/font-failure/reduced-motion tests,
and resolved Expo config. All 25 tests pass. Expo Doctor passes 20/21 checks and reports
pending patch updates for the existing Expo, constants, linking, router, SQLite and
jest-expo packages. Standalone release rendering remains to be verified.
