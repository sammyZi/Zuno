import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';

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
          size={24}
          color={disablePrevious ? colors.textMuted : colors.textPrimary}
        />
      </TouchableOpacity>

      {/* Play/Pause Button */}
      <TouchableOpacity
        onPress={onPlayPause}
        style={styles.primaryButton}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={32}
          color={colors.textPrimary}
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
          size={24}
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
    height: 80,
  },
  primaryButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
  },
  secondaryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.3,
  },
});
