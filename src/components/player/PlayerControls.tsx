/**
 * PlayerControls Component
 * Reusable play/pause/skip controls with animated feedback
 */

import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const playScale = useSharedValue(1);
  const prevScale = useSharedValue(1);
  const nextScale = useSharedValue(1);

  const animatePress = (sv: { value: number }) => {
    sv.value = withSequence(
      withTiming(0.85, { duration: 70 }),
      withSpring(1, { damping: 12 }),
    );
  };

  const playAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playScale.value }],
  }));
  const prevAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: prevScale.value }],
  }));
  const nextAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: nextScale.value }],
  }));

  return (
    <View style={[styles.container, style]}>
      {/* Previous Button */}
      <AnimatedPressable
        onPress={() => { animatePress(prevScale); onPrevious(); }}
        disabled={disablePrevious}
        style={[styles.secondaryButton, prevAnimStyle, disablePrevious && styles.disabled]}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.2)', borderless: true, radius: 26 }}
      >
        <Ionicons
          name="play-skip-back"
          size={22}
          color={disablePrevious ? colors.textMuted : colors.textPrimary}
        />
      </AnimatedPressable>

      {/* Play/Pause Button */}
      <AnimatedPressable
        onPress={() => { animatePress(playScale); onPlayPause(); }}
        style={[styles.primaryButton, playAnimStyle]}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: true, radius: 34 }}
      >
        <LinearGradient
          colors={[colors.primaryLight, colors.primary, colors.primaryDark]}
          style={styles.primaryButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={30}
            color="#fff"
            style={!isPlaying ? { marginLeft: 3 } : undefined}
          />
        </LinearGradient>
      </AnimatedPressable>

      {/* Next Button */}
      <AnimatedPressable
        onPress={() => { animatePress(nextScale); onNext(); }}
        disabled={disableNext}
        style={[styles.secondaryButton, nextAnimStyle, disableNext && styles.disabled]}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.2)', borderless: true, radius: 26 }}
      >
        <Ionicons
          name="play-skip-forward"
          size={22}
          color={disableNext ? colors.textMuted : colors.textPrimary}
        />
      </AnimatedPressable>
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
    borderRadius: 34,
    marginHorizontal: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  primaryButtonGradient: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.3,
  },
});
