# Later. — Android (Capacitor)

Native Android shell around the production web app at
[https://daily-digest-hub-three.vercel.app](https://daily-digest-hub-three.vercel.app).

## What you get

- Real Android app (`app.later.digest`) with home-screen icon
- **Share → Later.** from other apps (text / links land in the capture box via `/share`)
- Always loads the live Vercel site (no need to rebuild the APK for every web change)

## One-time setup

1. Install **[Android Studio](https://developer.android.com/studio)** (includes Android SDK).
2. Open this repo in a terminal and sync Capacitor:

```bash
npm install
npm run cap:sync
npm run cap:open
```

3. In Android Studio:
   - Wait for Gradle sync to finish
   - Plug in a phone (USB debugging on) **or** start an emulator
   - Click **Run** (green play)

## Build a sideload APK

In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.

Or from the `android/` folder:

```bash
cd android
.\gradlew.bat assembleDebug
```

APK path: `android/app/build/outputs/apk/debug/app-debug.apk`

Install on a phone:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## Share-to behavior

Sharing text/links into Later. opens:

`https://daily-digest-hub-three.vercel.app/share?url=…&text=…`

The web app prefills the pile input — pick a type and save.

## After web deploys

You usually **do not** need a new APK. Open the app and it loads the latest site.

Run this only when you change native Android code (manifest, icons, share handler):

```bash
npm run cap:sync
```

## Play Store (later)

1. In Android Studio: create a release keystore and **Build → Generate Signed Bundle / APK** (AAB).
2. Create a Play Console app listing for **Later.**
3. Upload the AAB, fill store listing, submit for review.

Package ID: `app.later.digest`

## Icons / splash

Default Capacitor icons are in `android/app/src/main/res/mipmap-*`.
Replace those PNGs (or use Android Studio’s Image Asset Studio) with the Later. mark from `public/icon.svg`.
Splash/status bar colors are set in `capacitor.config.ts` (`#f2ebe0`).
