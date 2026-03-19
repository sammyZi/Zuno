/**
 * AlbumCard Component
 * Card for displaying an album with square image
 */

import React from 'react';
import { Pressable, View, Text, StyleSheet, Image } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface AlbumCardProps {
  name: string;
  artist?: string;
  imageUri?: string;
  onPress: () => void;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({
  name,
  artist,
  imageUri,
  onPress,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
      onPress={onPress}
      android_ripple={{ color: 'rgba(255, 138, 0, 0.2)', borderless: false }}
    >
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {name}
      </Text>
      {artist && (
        <Text style={styles.artist} numberOfLines={1}>
          {artist}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 140,
    marginRight: spacing.md,
  },
  containerPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  imageContainer: {
    width: 140,
    height: 140,
    marginBottom: spacing.sm,
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.backgroundSecondary,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
  },
  placeholderText: {
    ...typography.h2,
    color: colors.primary,
  },
  name: {
    ...typography.body,
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 2,
  },
  artist: {
    ...typography.caption,
    color: colors.textMuted,
  },
});

