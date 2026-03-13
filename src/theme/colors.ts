/**
 * Color Design Tokens
 * Extracted from Figma design files
 */

export const colors = {
  // Primary Accents
  primary: '#FF8C28', // Orange accent
  primaryDark: '#E67A1A', // Darker orange for pressed states
  primaryLight: '#FFA040', // Lighter orange for hover
  secondary: '#5EF3CC', // Cyan/turquoise accent
  secondaryDark: '#4AD9B8', // Darker cyan
  secondaryLight: '#78F2D0', // Lighter cyan (gradient start)

  // Backgrounds (Dark Theme)
  backgroundPrimary: '#181A20', // Main background
  backgroundSecondary: '#1F222A', // Cards, elevated surfaces
  backgroundTertiary: '#20232C', // Hover states
  backgroundOverlay: 'rgba(24, 26, 32, 0.95)', // Modals

  // Text Colors (Dark Theme)
  textPrimary: '#FFFFFF', // Primary text
  textSecondary: '#FAFAFA', // Secondary text
  textTertiary: '#E3EAEC', // Metadata, disabled
  textMuted: '#B3B3B3', // Very subtle text

  // Status Colors
  success: '#5EF3CC', // Success states
  error: '#E22134', // Error states
  warning: '#FF8C28', // Warnings
  info: '#124853', // Info highlights

  // Light Theme (for future implementation)
  light: {
    backgroundPrimary: '#FFFFFF',
    backgroundSecondary: '#F5F5F5',
    backgroundTertiary: '#EEEEEE',
    textPrimary: '#000000',
    textSecondary: '#666666',
    textTertiary: '#999999',
  },
} as const;
