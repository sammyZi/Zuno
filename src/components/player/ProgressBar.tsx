/**
 * ProgressBar Component
 * Uses @react-native-community/slider for proper native slider behavior
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, spacing, typography } from '../../theme';

interface ProgressBarProps {
  currentPosition: number; // in milliseconds
  duration: number; // in milliseconds
  onSeek: (position: number) => void;
  showTimeLabels?: boolean;
  style?: ViewStyle;
}

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentPosition,
  duration,
  onSeek,
  showTimeLabels = true,
  style,
}) => {
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  const displayPosition = isSeeking ? seekValue : currentPosition;
  const progress = duration > 0 ? displayPosition / duration : 0;

  return (
    <View style={[styles.container, style]}>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration > 0 ? duration : 1}
        value={displayPosition}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.backgroundTertiary}
        thumbTintColor={colors.primary}
        onSlidingStart={(value) => {
          setIsSeeking(true);
          setSeekValue(value);
        }}
        onValueChange={(value) => {
          setSeekValue(value);
        }}
        onSlidingComplete={(value) => {
          setIsSeeking(false);
          onSeek(value);
        }}
      />
      {showTimeLabels && (
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(displayPosition)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  timeText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
