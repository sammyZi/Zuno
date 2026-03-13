// Design tokens
// colors, typography, spacing, borderRadius, shadows
/**
 * Theme Design Tokens
 * Central export for all design system tokens
 */

export { colors } from './colors';
export { typography, fontWeights, fontFamilies } from './typography';
export { spacing } from './spacing';
export { borderRadius } from './borderRadius';
export { shadows } from './shadows';

// Re-export all tokens as a single theme object for convenience
import { colors } from './colors';
import { typography, fontWeights, fontFamilies } from './typography';
import { spacing } from './spacing';
import { borderRadius } from './borderRadius';
import { shadows } from './shadows';

export const theme = {
  colors,
  typography,
  fontWeights,
  fontFamilies,
  spacing,
  borderRadius,
  shadows,
} as const;

