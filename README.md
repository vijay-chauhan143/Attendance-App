# Attendance App

A React Native technical assignment built with Expo. The app tracks the user's foreground GPS location, compares it with a configurable office location, and records check-ins when the user is within the configured geofence.

## Features

- Foreground GPS location tracking while the app is in use.
- Current latitude, longitude, and reported GPS accuracy.
- Configurable office coordinates, with a default location of `28.6139, 77.2090`.
- Office geofence with a default radius of 100 meters; the radius can be changed in Office Settings.
- Attendance check-in when location is inside the geofence and accuracy is sufficient.
- Duplicate check-in prevention for the current local calendar day.
- Attendance history persisted in AsyncStorage under `attendance_records`.
- Skeleton placeholders during initial location and attendance-history loading.
- Foreground location permission handling and user-facing permission/GPS error messages.
- Android map fallback when the Google Maps API key is not configured.

## Tech Stack

- Expo SDK 57
- React Native 0.86 and React 19
- TypeScript
- React Navigation (bottom tabs and native stack)
- `expo-location` for foreground permissions and GPS updates
- `react-native-maps` for the map, markers, and geofence circle
- `@react-native-async-storage/async-storage` for local attendance and office-location persistence
- `react-native-reanimated` and `expo-image` for existing animated/image components

## Project Structure

```text
AttendanceApp/
├── App.tsx
├── app.json
├── app.config.ts
├── package.json
├── .env.example
└── src/
    ├── components/       # Map, shared components, and UI helpers
    ├── constants/        # Theme and default office location
    ├── contexts/         # Office-location state and persistence access
    ├── hooks/            # Location and theme hooks
    ├── navigation/       # React Navigation tab and stack navigators
    ├── screens/          # Home, attendance history, office settings
    ├── services/         # Location, attendance, office-location, and storage services
    ├── types/            # Attendance, location, office-location, and CSS types
    └── utils/            # Distance calculation
```

`App.tsx` wraps the React Navigation app in the office-location provider. The Home and History screens are bottom tabs; Office Settings is a stack screen.

## Installation

Use a Node.js version supported by Expo SDK 57 (Node.js 22.13 or newer), then install dependencies:

```bash
npm install
```

## Running

Start the Expo development server:

```bash
npx expo start
```

To run the Android native development build:

```bash
npx expo run:android
```

## Android Google Maps API Key

The repository intentionally contains no real Google Maps API key. The key is supplied at build time through `GOOGLE_MAPS_API_KEY`; `app.config.ts` passes it to the `react-native-maps` config plugin for the Android native manifest and exposes only a configured/not-configured boolean to the JavaScript runtime.

### Reviewer Steps

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Set the key in `.env`:

   ```dotenv
   GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
   ```

   Replace the placeholder with the reviewer's own key. `.env` is ignored by Git; do not commit it.

3. In the key's Google Cloud project, enable **Maps SDK for Android** and configure any required billing. For an Android-restricted key, use package ID `com.vijaypratap.attendanceapp` and the SHA-1 fingerprint for the signing certificate used by the build.

4. Build and launch the Android app:

   ```bash
   npx expo run:android
   ```

The Google Maps key is native build configuration, so adding it requires rebuilding the Android app. Expo Go is not used for final Android Google Maps verification. Without a key, the Android app displays a map-area message instead of mounting the native Google Maps view.

## Testing and Validation

There is currently no automated test suite or `test` script in `package.json`. Available project checks are:

```bash
npx tsc --noEmit
npx expo lint
npx expo install --check
npx expo-doctor
```

Manual review should cover location permission granted/denied, GPS unavailable, office settings validation, inside/outside-geofence check-in eligibility, duplicate check-in prevention, attendance-history loading/empty/error states, and Android map behavior with and without a configured key.

The current lint command reports an existing `react-hooks/set-state-in-effect` violation in `src/hooks/use-color-scheme.web.ts`; this is unrelated to the attendance flow.

## Known Limitations and Setup Requirements

- A Google Maps API key and an Android development build are required to display Google map tiles in the app's Android binary. The key must have Maps SDK for Android enabled and must match the package/signing restrictions configured in Google Cloud.
- Without the key, the app launches and shows a map fallback; the native Android map is not mounted.
- Attendance history can be viewed but cannot currently be cleared from the app.
- Location tracking uses foreground permissions and is not configured as background tracking.

## Assignment Submission Notes

- Include the source code and this README with the submission.
- Do not include `.env` or a real Google Maps API key. The reviewer supplies their own key using the steps above.
- Include any build or device-specific results separately; Expo Doctor and dependency checks do not verify Google Cloud key restrictions or map-tile access on a device.
- Be explicit that Clear History is not implemented in the current app.