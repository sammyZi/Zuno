# Media Notifications & Lock Screen Controls

## Current Limitation

`expo-av` doesn't provide full media session support with playback controls on the lock screen. To get proper media notifications with play/pause/next/previous buttons on the lock screen, you need to use `react-native-track-player`.

## Option 1: Install react-native-track-player (Recommended for Music Apps)

```bash
npm install react-native-track-player
npx expo prebuild
npm run android
```

This provides:
- ✅ Full media session support
- ✅ Lock screen controls (play/pause/next/previous)
- ✅ Notification with album art
- ✅ Better battery life
- ✅ Background playback
- ✅ CarPlay/Android Auto support

**Note:** This requires ejecting from Expo managed workflow and rebuilding the native code.

## Option 2: Current Setup (Limited)

The current implementation uses `expo-av` which provides:
- ✅ Basic audio playback
- ✅ Background audio
- ❌ No lock screen controls
- ❌ No media notification buttons

## Why expo-av Doesn't Show Controls

`expo-av` uses Android's AudioFocus but doesn't implement MediaSession API, which is required for:
- Lock screen playback controls
- Notification media buttons
- Bluetooth/headset controls

## Recommendation

For a production music player app, I strongly recommend migrating to `react-native-track-player`. It's the industry standard for React Native music apps and provides all the features users expect from a music player.

Would you like me to help you migrate to `react-native-track-player`?
