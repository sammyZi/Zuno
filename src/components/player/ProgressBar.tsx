import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, spacing } from '../../theme';

interface ProgressBarProps {
  currentPosition: number; // in milliseconds
  duration: number; // in milliseconds
  onSeek: (position: number) => void;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentPosition,
  duration,
  onSeek,
  style,
}) => {
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);

  const handleSlidingStart = () => {
    setIsSeeking(true);
  };

  const handleValueChange = (value: number) => {
    setSeekPosition(value);
  };

  const handleSlidingComplete = (value: number) => {
    setIsSeeking(false);
    onSeek(value);
  };

  const displayPosition = isSeeking ? seekPosition : currentPosition;
  const progress = duration > 0 ? displayPosition / duration : 0;

  return (
    <View style={[styles.container, style]}>
      <Slider
        style={styles.slider}
        value={displayPosition}
        minimumValue={0}
        maximumValue={duration}
        minimumTrackTintColor={colors.secondary}
        maximumTrackTintColor={colors.backgroundSecondary}
        thumbTintColor={colors.textPrimary}
        onSlidingStart={handleSlidingStart}
        onValueChange={handleValueChange}
        onSlidingComplete={handleSlidingComplete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 20,
    justifyContent: 'center',
  },
  slider: {
    width: '100%',
    height: 4,
  },
});
