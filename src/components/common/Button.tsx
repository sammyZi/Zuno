/**
 * Button Component
 * Reusable button with primary, secondary, and icon variants
 * Fully themed with design tokens
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'icon' | 'ghost';

interface ButtonProps {
  variant?: ButtonVariant;
  title?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  title,
  icon,
  iconSize = 20,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return { ...styles.button, ...styles.primaryButton };
      case 'secondary':
        return { ...styles.button, ...styles.secondaryButton };
      case 'icon':
        return { ...styles.button, ...styles.iconButton };
      case 'ghost':
        return { ...styles.button, ...styles.ghostButton };
      default:
        return styles.button;
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'ghost':
        return styles.ghostText;
      default:
        return styles.primaryText;
    }
  };

  const getIconColor = (): string => {
    if (disabled) return colors.textMuted;
    switch (variant) {
      case 'primary':
        return colors.backgroundPrimary;
      case 'icon':
        return colors.textPrimary;
      default:
        return colors.textPrimary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.backgroundPrimary : colors.primary}
          size="small"
        />
      ) : (
        <View style={styles.inner}>
          {icon && variant === 'icon' && (
            <Ionicons name={icon} size={iconSize} color={getIconColor()} />
          )}
          {icon && variant !== 'icon' && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={getIconColor()}
              style={title ? styles.iconWithText : undefined}
            />
          )}
          {title && variant !== 'icon' && (
            <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.xl,
    ...shadows.small,
  },
  secondaryButton: {
    backgroundColor: colors.backgroundSecondary,
    height: 50,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.backgroundTertiary,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.round,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.backgroundTertiary,
  },
  ghostButton: {
    height: 50,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.xl,
    backgroundColor: 'transparent',
  },
  primaryText: {
    ...typography.bodyLarge,
    color: colors.backgroundPrimary,
    fontWeight: '600',
  },
  secondaryText: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  ghostText: {
    ...typography.bodyLarge,
    color: colors.primary,
    fontWeight: '600',
  },
  iconWithText: {
    marginRight: spacing.sm,
  },
  disabled: {
    opacity: 0.45,
  },
});
