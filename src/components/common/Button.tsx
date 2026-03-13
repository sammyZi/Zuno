import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'icon';

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
    const baseStyle = styles.button;
    
    switch (variant) {
      case 'primary':
        return { ...baseStyle, ...styles.primaryButton };
      case 'secondary':
        return { ...baseStyle, ...styles.secondaryButton };
      case 'icon':
        return { ...baseStyle, ...styles.iconButton };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      default:
        return styles.primaryText;
    }
  };

  const getIconColor = (): string => {
    if (disabled) return colors.textMuted;
    return colors.textPrimary;
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
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={colors.textPrimary} size="small" />
      ) : (
        <>
          {icon && variant === 'icon' && (
            <Ionicons name={icon} size={iconSize} color={getIconColor()} />
          )}
          {icon && variant !== 'icon' && title && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={getIconColor()}
              style={styles.iconWithText}
            />
          )}
          {title && variant !== 'icon' && (
            <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // Accessibility minimum
  },
  primaryButton: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  secondaryButton: {
    backgroundColor: colors.backgroundSecondary,
    height: 48,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.textMuted,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    backgroundColor: 'transparent',
  },
  primaryText: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
  },
  secondaryText: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
  },
  iconWithText: {
    marginRight: spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
});
