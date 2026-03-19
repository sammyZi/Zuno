/**
 * SongItem Component
 * Matches Figma design:
 *  - Square album art (rounded corners)
 *  - Title (bold, white)
 *  - Artist  |  Duration (subtitle, muted)
 *  - Orange play/pause circle button
 *  - 3-dot menu
 */

import React from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';
import { AlbumArt } from './AlbumArt';

import { useFavoritesStore, useDownloadStore } from '../../store';
import { Song } from '../../types/api';

interface SongItemProps {
  song?: Song; // Accept full song object for easy favoring
  title: string;
  artist: string;
  duration?: string;
  albumArtUri?: string;
  onPress: () => void;
  onLongPress?: () => void;
  onMorePress?: (song: Song) => void;
  isPlaying?: boolean;
  style?: ViewStyle;
  showMoreButton?: boolean;
  showPlayButton?: boolean;
}

export const SongItem: React.FC<SongItemProps> = ({
  song,
  title,
  artist,
  duration,
  albumArtUri,
  onPress,
  onLongPress,
  onMorePress,
  isPlaying = false,
  style,
  showMoreButton = true,
  showPlayButton = true,
}) => {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { isDownloaded } = useDownloadStore();
  const isFav = song ? isFavorite(song.id) : false;
  const isOffline = song ? isDownloaded(song.id) : false;

  const handleMorePress = () => {
    if (song && onMorePress) {
      onMorePress(song);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        style,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
    >
      {/* Square album art */}
      <AlbumArt uri={albumArtUri} size="medium" />

      {/* Info */}
      <View style={styles.info}>
        <Text
          style={[styles.title, isPlaying && styles.titleActive]}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {artist}{duration ? `  |  ${duration}` : ''}
        </Text>
      </View>

      {/* Downloaded Indicator */}
      {isOffline && (
        <View style={styles.downloadedIndicator}>
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={colors.secondary}
          />
        </View>
      )}

      {/* Orange play button */}
      {showPlayButton && (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [
            styles.playButton,
            isPlaying && styles.playButtonActive,
            pressed && styles.playButtonPressed,
          ]}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: true, radius: 14 }}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={12}
            color={isPlaying ? colors.backgroundPrimary : colors.backgroundPrimary}
          />
        </Pressable>
      )}

      {/* 3-dot menu */}
      {showMoreButton && onMorePress && song && (
        <Pressable
          onPress={handleMorePress}
          style={({ pressed }) => [
            styles.moreButton,
            pressed && styles.moreButtonPressed,
          ]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.2)', borderless: true, radius: 16 }}
        >
          <Ionicons name="ellipsis-vertical" size={16} color={colors.textMuted} />
        </Pressable>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  titleActive: {
    color: colors.primary,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
  },
  downloadedIndicator: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  playButton: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  playButtonActive: {
    backgroundColor: colors.primaryDark,
  },
  playButtonPressed: {
    transform: [{ scale: 0.9 }],
    opacity: 0.8,
  },
  moreButton: {
    padding: spacing.xs,
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButtonPressed: {
    opacity: 0.5,
  },
});
