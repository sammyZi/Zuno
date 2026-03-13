/**
 * SuggestedSongCard Component
 * Horizontal card with square album art, song name, and artist
 * Used in the "Suggested for You" horizontal scroll
 */

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface SuggestedSongCardProps {
  title: string;
  artist: string;
  imageUri?: string;
  isPlaying?: boolean;
  onPress: () => void;
}

export const SuggestedSongCard: React.FC<SuggestedSongCardProps> = ({
  title,
  artist,
  imageUri,
  isPlaying = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isPlaying && styles.containerActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Square Album Art */}
      <View style={styles.imageWrapper}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Ionicons name="musical-notes" size={32} color={colors.textMuted} />
          </View>
        )}
        {isPlaying && (
          <View style={styles.playingBadge}>
            <Ionicons name="volume-high" size={10} color={colors.primary} />
          </View>
        )}
      </View>

      {/* Song Info */}
      <Text
        style={[styles.title, isPlaying && styles.titleActive]}
        numberOfLines={1}
      >
        {title}
      </Text>
      <Text style={styles.artist} numberOfLines={1}>
        {artist}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 150,
    marginRight: spacing.md,
  },
  containerActive: {},
  imageWrapper: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.backgroundSecondary,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
  },
  playingBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '60',
  },
  title: {
    ...typography.body,
    fontSize: 13,
    color: colors.textPrimary,
    fontFamily: 'Poppins_600SemiBold',
  },
  titleActive: {
    color: colors.primary,
  },
  artist: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
});
