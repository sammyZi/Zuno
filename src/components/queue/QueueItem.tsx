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
import { AlbumArt } from '../song/AlbumArt';

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
  const imageUrl = getImageUrl(song.image, 'small');
  const artistNames = getArtistNames(song);
  const duration = formatDuration(song.duration);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isActive && styles.dragging,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      onLongPress={drag}
    >
      {/* Drag Handle (Left) */}
      <TouchableOpacity
        style={styles.dragHandle}
        onPressIn={drag}
        activeOpacity={0.7}
      >
        <Ionicons name="reorder-two" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      {/* Album Art */}
      <AlbumArt uri={imageUrl} size="small" />

      {/* Song Info */}
      <View style={styles.songInfo}>
        <Text
          style={[styles.songTitle, isCurrentlyPlaying && styles.currentlyPlayingText]}
          numberOfLines={1}
        >
          {song.name}
        </Text>
        <Text style={styles.artistName} numberOfLines={1}>
          {artistNames}  |  {duration}
        </Text>
      </View>

      {/* Delete Button */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={onDelete}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragging: {
    opacity: 0.8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  dragHandle: {
    paddingRight: spacing.sm,
    justifyContent: 'center',
  },
  songInfo: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
    justifyContent: 'center',
  },
  songTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  currentlyPlayingText: {
    color: colors.primary,
  },
  artistName: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
  },
  deleteButton: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
});
