/**
 * PlayerControls Component
 * Play/Pause, Previous, Next controls with themed styling
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  disableNext?: boolean;
  disablePrevious?: boolean;
  style?: ViewStyle;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  disableNext = false,
  disablePrevious = false,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Previous Button */}
      <TouchableOpacity
        onPress={onPrevious}
        disabled={disablePrevious}
        style={[styles.secondaryButton, disablePrevious && styles.disabled]}
        activeOpacity={0.7}
      >
        <Ionicons
          name="play-skip-back"
          size={22}
          color={disablePrevious ? colors.textMuted : colors.textPrimary}
        />
      </TouchableOpacity>

      {/* Play/Pause Button */}
      <TouchableOpacity
        onPress={onPlayPause}
        style={styles.primaryButton}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={30}
          color={colors.backgroundPrimary}
        />
      </TouchableOpacity>

      {/* Next Button */}
      <TouchableOpacity
        onPress={onNext}
        disabled={disableNext}
        style={[styles.secondaryButton, disableNext && styles.disabled]}
        activeOpacity={0.7}
      >
        <Ionicons
          name="play-skip-forward"
          size={22}
          color={disableNext ? colors.textMuted : colors.textPrimary}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  primaryButton: {
    width: 68,
    height: 68,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    ...shadows.medium,
  },
  secondaryButton: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.round,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.backgroundTertiary,
  },
  disabled: {
    opacity: 0.3,
  },
});
