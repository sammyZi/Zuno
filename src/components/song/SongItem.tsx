/**
 * SongItem Component
 * List item for displaying a song with album art, title, artist, and controls
 */

import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { AlbumArt } from './AlbumArt';

interface SongItemProps {
  title: string;
  artist: string;
  duration?: string;
  albumArtUri?: string;
  onPress: () => void;
  onMorePress?: () => void;
  isPlaying?: boolean;
  style?: ViewStyle;
}

export const SongItem: React.FC<SongItemProps> = ({
  title,
  artist,
  duration,
  albumArtUri,
  onPress,
  onMorePress,
  isPlaying = false,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isPlaying && styles.containerActive, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.albumArtWrapper}>
        <AlbumArt uri={albumArtUri} size="small" />
        {isPlaying && (
          <View style={styles.playingOverlay}>
            <Ionicons name="volume-high" size={14} color={colors.primary} />
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text
          style={[styles.title, isPlaying && styles.titleActive]}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {artist}
        </Text>
      </View>

      {duration && (
        <Text style={styles.duration}>{duration}</Text>
      )}

      {onMorePress && (
        <TouchableOpacity
          onPress={onMorePress}
          style={styles.moreButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={18}
            color={colors.textMuted}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    minHeight: 72,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  containerActive: {
    borderColor: colors.primary + '40',
    backgroundColor: colors.backgroundTertiary,
  },
  albumArtWrapper: {
    position: 'relative',
  },
  playingOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '60',
  },
  infoContainer: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  titleActive: {
    color: colors.primary,
  },
  artist: {
    ...typography.body,
    color: colors.textMuted,
  },
  duration: {
    ...typography.caption,
    color: colors.textMuted,
    marginRight: spacing.sm,
  },
  moreButton: {
    padding: spacing.xs,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
