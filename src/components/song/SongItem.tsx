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
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';
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
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      {/* Square album art */}
      <AlbumArt uri={albumArtUri} size="small" />

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

      {/* Orange play button */}
      <TouchableOpacity
        onPress={onPress}
        style={[styles.playButton, isPlaying && styles.playButtonActive]}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={14}
          color={isPlaying ? colors.backgroundPrimary : colors.backgroundPrimary}
        />
      </TouchableOpacity>

      {/* 3-dot menu */}
      {onMorePress && (
        <TouchableOpacity
          onPress={onMorePress}
          style={styles.moreButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="ellipsis-vertical" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
  playButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  playButtonActive: {
    backgroundColor: colors.primaryDark,
  },
  moreButton: {
    padding: spacing.xs,
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
