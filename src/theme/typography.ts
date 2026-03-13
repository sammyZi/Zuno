/**
 * Typography Design Tokens
 * Using Poppins font family with various weights
 */

import { colors } from './colors';

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    fontFamily: 'Poppins_700Bold',
    lineHeight: 34,
    color: colors.textPrimary,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    fontFamily: 'Poppins_700Bold',
    lineHeight: 29,
    color: colors.textPrimary,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    fontFamily: 'Poppins_600SemiBold',
    lineHeight: 24,
    color: colors.textPrimary,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '600' as const,
    fontFamily: 'Poppins_600SemiBold',
    lineHeight: 24,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 21,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 18,
    color: colors.textTertiary,
  },
  small: {
    fontSize: 10,
    fontWeight: '400' as const,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 15,
    color: colors.textTertiary,
  },
} as const;

// Font weights for direct use
export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

// Font families
export const fontFamilies = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;
