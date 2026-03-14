/**
 * Queue Item Component
 * Displays a song in the queue with drag handle and delete button
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Song } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { getImageUrl, getArtistNames, formatDuration } from '../../utils/audio';

interface QueueItemProps {
  song: Song;
  index: number;
  isCurrentlyPlaying: boolean;
  onDelete: () => void;
  onPress: () => void;
  drag?: () => void;
  isActive?: boolean;
}

export const QueueItem: React.FC<QueueItemProps> = ({
  song,
  index,
  isCurrentlyPlaying,
  onDelete,
  onPress,
  drag,
  isActive = false,
}) => {
  const imageUrl = getImageUrl(song.image, 'medium');
  const artistNames = getArtistNames(song);
  const duration = formatDuration(song.duration);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isCurrentlyPlaying && styles.currentlyPlaying,
        isActive && styles.dragging,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Drag Handle */}
      <TouchableOpacity
        style={styles.dragHandle}
        onLongPress={drag}
        delayLongPress={100}
        activeOpacity={0.7}
      >
        <Ionicons name="reorder-two" size={24} color={colors.textMuted} />
      </TouchableOpacity>

      {/* Album Art */}
      <Image source={{ uri: imageUrl }} style={styles.albumArt} />

      {/* Song Info */}
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {song.name}
        </Text>
        <Text style={styles.artistName} numberOfLines={1}>
          {artistNames}
        </Text>
      </View>

      {/* Duration */}
      <Text style={styles.duration}>{duration}</Text>

      {/* Delete Button */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={onDelete}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close-circle" size={24} color={colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  currentlyPlaying: {
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  dragging: {
    opacity: 0.7,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dragHandle: {
    paddingRight: spacing.sm,
    paddingVertical: spacing.sm,
  },
  albumArt: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.small,
    marginRight: spacing.sm,
  },
  songInfo: {
    flex: 1,
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  songTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  artistName: {
    ...typography.caption,
    color: colors.textMuted,
  },
  duration: {
    ...typography.caption,
    color: colors.textTertiary,
    marginRight: spacing.sm,
  },
  deleteButton: {
    padding: spacing.xs,
  },
});
