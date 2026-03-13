/**
 * Border Radius Design Tokens
 * Extracted from Figma design files
 */

export const borderRadius = {
  none: 0, // Sharp corners (rare)
  small: 6, // Small buttons, tags
  medium: 12, // Cards, song items, buttons
  large: 16, // Large cards, modals
  xlarge: 20, // Album artwork, player images
  round: 9999, // Circular buttons, avatars, play button
} as const;
