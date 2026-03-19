/**
 * Mini Player Example
 * Compact now-playing bar shown at the bottom of the screen
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayerStore } from '../../store';
import { usePlayback } from '../../hooks';
import { AlbumArt } from '../song/AlbumArt';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

export const MiniPlayerExample: React.FC = () => {
  const { currentSong, isPlaying } = usePlayerStore();
  const { togglePlayPause } = usePlayback();

  if (!currentSong) {
    return null;
  }

  const albumArt =
    currentSong.image.find((img) => img.quality === '150x150')?.url ||
    currentSong.image[0]?.url;

  const artistName = currentSong.artists.primary.map((a) => a.name).join(', ');

  return (
    <View style={styles.container}>
      {/* Progress line at top */}
      <View style={styles.progressLine} />

      <View style={styles.inner}>
        <AlbumArt uri={albumArt} size="small" />

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentSong.name}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {artistName}
          </Text>
        </View>

        <Pressable
          onPress={togglePlayPause}
          style={styles.playButton}
          
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={20}
            color={colors.backgroundPrimary}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundTertiary,
    ...shadows.medium,
  },
  progressLine: {
    height: 2,
    width: '35%', // simulated progress
    backgroundColor: colors.primary,
    borderRadius: borderRadius.round,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  info: {
    flex: 1,
  },
  title: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 2,
  },
  artist: {
    ...typography.caption,
    color: colors.textMuted,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

