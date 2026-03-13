/**
 * Mini Player Example
 * Example component showing how to use the stores in a real component
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { usePlayerStore } from '../../store';
import { usePlayback } from '../../hooks';

export const MiniPlayerExample: React.FC = () => {
  const { currentSong, isPlaying } = usePlayerStore();
  const { togglePlayPause } = usePlayback();

  if (!currentSong) {
    return null;
  }

  const albumArt = currentSong.image.find((img) => img.quality === '150x150')?.url || currentSong.image[0]?.url;

  const artistName = currentSong.artists.primary.map((a) => a.name).join(', ');

  return (
    <View style={styles.container}>
      <Image source={{ uri: albumArt }} style={styles.albumArt} />

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {currentSong.name}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {artistName}
        </Text>
      </View>

      <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
        <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F222A',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#181A20',
  },
  albumArt: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 12,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  artist: {
    fontSize: 12,
    color: '#FAFAFA',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF8C28',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});
