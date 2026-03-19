/**
 * CategoryTab Component
 * Figma-matched tab button for category selection
 * Active: Orange text + bottom underline
 * Inactive: Gray text
 */

import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';

interface CategoryTabProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export const CategoryTab: React.FC<CategoryTabProps> = ({
  label,
  isActive,
  onPress,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      android_ripple={{ color: 'rgba(255, 138, 0, 0.2)', borderless: true }}
    >
      <Text
        style={[styles.label, isActive && styles.labelActive]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {isActive && <View style={styles.underline} />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    fontSize: 15,
    color: colors.textMuted,
    fontFamily: 'Poppins_500Medium',
    letterSpacing: 0.3,
  },
  labelActive: {
    color: colors.primary,
    fontFamily: 'Poppins_600SemiBold',
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});
