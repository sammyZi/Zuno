# Font Setup Instructions

## Poppins Font (Google Fonts)

This project uses **Poppins** - a friendly, rounded Google Font that's excellent for UI design.

### Installation

The font is already installed via:
```bash
npx expo install @expo-google-fonts/poppins
```

### Font Weights Used

- **Poppins_400Regular** - Body text, descriptions
- **Poppins_500Medium** - Emphasized text, artist names
- **Poppins_600SemiBold** - Subheadings, song titles
- **Poppins_700Bold** - Headings, screen titles

### Usage in Components

```typescript
import { Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  },
  body: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
});
```

### Status

✅ **Ready to use** - Font is installed and configured in App.tsx

