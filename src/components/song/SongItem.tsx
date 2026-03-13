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
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <AlbumArt uri={albumArtUri} size="small" />
      
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {artist}
        </Text>
      </View>

      {duration && (
        <Text style={styles.duration}>{duration}</Text>
      )}

      {isPlaying && (
        <Ionicons
          name="volume-high"
          size={20}
          color={colors.primary}
          style={styles.playingIcon}
        />
      )}

      {onMorePress && (
        <TouchableOpacity
          onPress={onMorePress}
          style={styles.moreButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={20}
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
  artist: {
    ...typography.body,
    color: colors.textMuted,
  },
  duration: {
    ...typography.caption,
    color: colors.textMuted,
    marginRight: spacing.sm,
  },
  playingIcon: {
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
