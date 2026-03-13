/**
 * ArtistCard Component
 * Card for displaying an artist with circular image
 */

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
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
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 120,
    alignItems: 'center',
    marginRight: spacing.md,
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
