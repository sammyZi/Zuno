/**
 * Audio Playback Example Component
 * Demonstrates AudioService integration with playerStore
 * This component can be used for testing audio playback functionality
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { usePlayerStore } from '../../store/playerStore';
import { Song } from '../../types';
import { formatDuration } from '../../utils/audio';

// Example song for testing
const EXAMPLE_SONG: Song = {
  id: '1',
  name: 'Test Song',
  duration: 180,
  language: 'english',
  album: {
    id: '1',
    name: 'Test Album',
  },
  artists: {
    primary: [
      {
        id: '1',
        name: 'Test Artist',
      },
    ],
  },
  image: [
    {
      quality: '500x500',
      url: 'https://via.placeholder.com/500',
    },
  ],
  downloadUrl: [
    {
      quality: '320kbps',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Free test audio
    },
  ],
};

export const AudioPlaybackExample: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    isLoading,
    position,
    duration,
    error,
    play,
    pause,
    togglePlayPause,
    seekTo,
    initialize,
  } = usePlayerStore();

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  const handlePlay = async () => {
    await play(EXAMPLE_SONG);
  };

  const handleSeekForward = async () => {
    await seekTo(position + 10);
  };

  const handleSeekBackward = async () => {
    await seekTo(Math.max(0, position - 10));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio Playback Test</Text>

      {/* Current Song Info */}
      <View style={styles.songInfo}>
        <Text style={styles.songName}>
          {currentSong ? currentSong.name : 'No song loaded'}
        </Text>
        {currentSong && (
          <Text style={styles.artistName}>
            {currentSong.artists.primary[0]?.name || 'Unknown Artist'}
          </Text>
        )}
      </View>

      {/* Playback Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>{formatDuration(position)}</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: duration > 0 ? `${(position / duration) * 100}%` : '0%' },
            ]}
          />
        </View>
        <Text style={styles.timeText}>{formatDuration(duration)}</Text>
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF8C28" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Playback Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSeekBackward}
          disabled={!currentSong}
        >
          <Text style={styles.buttonText}>-10s</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.playButton]}
          onPress={currentSong ? togglePlayPause : handlePlay}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isPlaying ? 'Pause' : currentSong ? 'Play' : 'Load & Play'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSeekForward}
          disabled={!currentSong}
        >
          <Text style={styles.buttonText}>+10s</Text>
        </TouchableOpacity>
      </View>

      {/* Status Info */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {isPlaying ? 'Playing' : isLoading ? 'Loading' : 'Paused'}
        </Text>
        <Text style={styles.statusText}>
          Position: {position.toFixed(1)}s / {duration.toFixed(1)}s
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#181A20',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  songInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  songName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  artistName: {
    fontSize: 14,
    color: '#FAFAFA',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#282828',
    borderRadius: 2,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF8C28',
  },
  timeText: {
    fontSize: 12,
    color: '#B3B3B3',
    width: 45,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
  },
  errorContainer: {
    backgroundColor: '#E22134',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#282828',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  playButton: {
    backgroundColor: '#FF8C28',
    paddingHorizontal: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    color: '#B3B3B3',
    fontSize: 12,
    marginBottom: 5,
  },
});
