import React from 'react';
import { Image, StyleSheet, View, ImageStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius } from '../../theme';

type AlbumArtSize = 'mini' | 'small' | 'medium' | 'large' | 'player';

interface AlbumArtProps {
  uri?: string;
  size?: AlbumArtSize;
  style?: ImageStyle;
}

const SIZE_MAP: Record<AlbumArtSize, number> = {
  mini: 40,
  small: 48,
  medium: 64,
  large: 80,
  player: 320,
};

const BORDER_RADIUS_MAP: Record<AlbumArtSize, number> = {
  mini: borderRadius.small,
  small: borderRadius.small,
  medium: borderRadius.medium,
  large: borderRadius.medium,
  player: borderRadius.xlarge,
};

export const AlbumArt: React.FC<AlbumArtProps> = ({
  uri,
  size = 'small',
  style,
}) => {
  const dimension = SIZE_MAP[size];
  const radius = BORDER_RADIUS_MAP[size];

  const containerStyle = {
    width: dimension,
    height: dimension,
    borderRadius: radius,
  };

  if (!uri) {
    return (
      <View style={[styles.placeholder, containerStyle, style]}>
        <Ionicons
          name="musical-notes"
          size={dimension * 0.4}
          color={colors.textMuted}
        />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[styles.image, containerStyle, style]}
      resizeMode="cover"
    />
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.backgroundSecondary,
  },
  placeholder: {
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
