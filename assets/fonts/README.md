# Font Setup Instructions

## Iosevka Charon Mono Font

This project uses **Iosevka Charon Mono** as specified in the design requirements.

### Download Instructions

1. Visit the Iosevka releases page: https://github.com/be5invis/Iosevka/releases
2. Download the latest release (look for `PkgTTF-IosevkaCharonMono-*.zip`)
3. Extract the following font files to this directory (`assets/fonts/`):
   - `IosevkaCharonMono-Regular.ttf`
   - `IosevkaCharonMono-Medium.ttf`
   - `IosevkaCharonMono-SemiBold.ttf`
   - `IosevkaCharonMono-Bold.ttf`

### Alternative: Use a UI-Friendly Font

Since Iosevka Charon Mono is a monospace font designed for code, you may prefer a more UI-friendly Google Font:

**Recommended alternatives:**
- **Inter** - Modern, clean, excellent for UI
- **Poppins** - Friendly, rounded
- **Roboto** - Material Design standard

To use Inter instead:
```bash
npx expo install @expo-google-fonts/inter
```

Then update the font loading in `App.tsx` accordingly.

### Current Status

⚠️ **Action Required**: Download the font files and place them in this directory before running the app.
