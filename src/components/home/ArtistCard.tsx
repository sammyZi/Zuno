/**
 * ArtistCard Component
 * Card for displaying an artist with circular image
 */

import React from 'react';
import { Pressable, View, Text, StyleSheet, Image } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface ArtistCardProps {
  name: string;
  imageUri?: string;
  onPress: () => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({
  name,
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
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 120,
    alignItems: 'center',
    marginRight: spacing.md,
  },
  containerPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  imageContainer: {
    width: 100,
    height: 100,
    marginBottom: spacing.sm,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    color: colors.textPrimary,
    textAlign: 'center',
    fontFamily: 'Poppins_500Medium',
  },
});

