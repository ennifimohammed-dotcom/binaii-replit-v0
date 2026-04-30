# binaii — Construction Expense Tracker

A premium, bank-level construction expense tracker built with Expo + React Native.
Pre-loaded with the **ENNIFI 2025** project (64 real expenses imported from your Excel sheet).

## Features

- Smart dashboard with line / bar / donut charts
- Multi-project support (CRUD with color tags)
- Expense CRUD with 10 categories and smart category suggestion
- Global + per-category budgets
- AI-style insights and a financial health score
- Search and chip-based filters
- Light / dark mode (follows device)
- MAD currency, fully offline (AsyncStorage persistence)

## Local development

```bash
npm install
npm run start   # then press a (Android) or i (iOS) or w (web)
```

## Build an APK with EAS Build (recommended)

This is the easiest way to get an installable `.apk` from GitHub.

### One-time setup

1. Create a free Expo account at [expo.dev](https://expo.dev).
2. Generate an access token: **Account settings → Access tokens → Create**.
3. In your GitHub repository: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `EXPO_TOKEN`
   - Value: *(paste the token)*
4. Initialize the EAS project once locally (only needed the first time):

   ```bash
   npm install -g eas-cli
   eas login
   eas init    # creates the project on Expo and writes the projectId into app.json
   git add app.json && git commit -m "init eas project" && git push
   ```

### Trigger a build

- **Automatic:** every push to `main` triggers `.github/workflows/build-apk.yml`.
- **Manual:** GitHub → **Actions → Build Android APK → Run workflow**.

When the build finishes (≈ 10–15 min on the EAS free tier), open
[expo.dev/accounts/<you>/projects/binaii/builds](https://expo.dev) to download
the APK and install it on any Android device.

## Build an APK locally (advanced)

Requires Android SDK, JDK 17, and Gradle:

```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

## Reset the seed data

The ENNIFI 2025 project is loaded once on first launch. To re-seed:

- Open the app → **More → Settings → Reset all data**.

## Project structure

```
app/            expo-router screens (tabs, modals)
components/     UI building blocks (charts, rows, forms)
constants/      colors, categories
context/        global app state (AppContext)
lib/            storage, seed, insights, formatting helpers
hooks/          custom hooks (theme colors, etc.)
assets/         icons, fonts
```
