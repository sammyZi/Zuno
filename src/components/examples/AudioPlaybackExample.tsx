/**
 * Audio Playback Example Component
 * Demonstrates AudioService integration with playerStore
 * This component can be used for testing audio playback functionality
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { usePlayerStore } from '../../store/playerStore';
import { Song } from '../../types';
import { formatDuration } from '../../utils/audio';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { ProgressBar } from '../player/ProgressBar';
import { PlayerControls } from '../player/PlayerControls';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

// Example song for testing
const EXAMPLE_SONG: Song = {
  id: '1',
  name: 'SoundHelix Song 1',
  duration: 230,
  language: 'english',
  album: {
    id: '1',
    name: 'Test Album',
  },
  artists: {
    primary: [
      {
        id: '1',
        name: 'SoundHelix',
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
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
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
    togglePlayPause,
    seekTo,
    initialize,
  } = usePlayerStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handlePlay = async () => {
    await play(EXAMPLE_SONG);
  };

  const handleSeek = async (ms: number) => {
    await seekTo(ms / 1000); // Convert ms -> seconds
  };

  const artistName =
    currentSong?.artists.primary.map((a) => a.name).join(', ') ?? '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Audio Playback Test</Text>
          <View
            style={[
              styles.statusPill,
              isPlaying
                ? styles.statusPlaying
                : isLoading
                ? styles.statusLoading
                : styles.statusPaused,
            ]}
          >
            <Text style={styles.statusText}>
              {isPlaying ? 'Playing' : isLoading ? 'Loading' : 'Paused'}
            </Text>
          </View>
        </View>

        {/* Song Info Card */}
        <View style={styles.songCard}>
          <View style={styles.songArtPlaceholder}>
            <Text style={styles.musicEmoji}>🎵</Text>
          </View>
          <Text style={styles.songName} numberOfLines={2}>
            {currentSong ? currentSong.name : 'No song loaded'}
          </Text>
          {currentSong && (
            <Text style={styles.artistName}>{artistName}</Text>
          )}

          {/* Loading */}
          {isLoading && (
            <LoadingSpinner
              size="large"
              label="Loading audio..."
              style={styles.spinner}
            />
          )}

          {/* Error */}
          {error && !isLoading && (
            <ErrorMessage
              message={error}
              onRetry={handlePlay}
              style={styles.errorSection}
            />
          )}

          {/* Progress Slider */}
          {!isLoading && !error && (
            <ProgressBar
              currentPosition={position * 1000} // seconds -> ms
              duration={duration > 0 ? duration * 1000 : EXAMPLE_SONG.duration * 1000}
              onSeek={handleSeek}
              showTimeLabels
              style={styles.progress}
            />
          )}
        </View>

        {/* Player Controls */}
        <View style={styles.controlsCard}>
          <PlayerControls
            isPlaying={isPlaying}
            onPlayPause={currentSong ? togglePlayPause : handlePlay}
            onNext={() => {}}
            onPrevious={() => {}}
            disableNext
            disablePrevious
          />

          {/* Seek Buttons */}
          <View style={styles.seekRow}>
            <Button
              variant="secondary"
              icon="play-back"
              title="-10s"
              iconSize={16}
              onPress={() => handleSeek(Math.max(0, position * 1000 - 10000))}
              disabled={!currentSong}
              style={styles.seekButton}
            />
            {!currentSong && (
              <Button
                variant="primary"
                icon="play"
                title="Load & Play"
                onPress={handlePlay}
                loading={isLoading}
                style={styles.loadButton}
              />
            )}
            <Button
              variant="secondary"
              icon="play-forward"
              title="+10s"
              iconSize={16}
              onPress={() =>
                handleSeek(Math.min(duration * 1000, position * 1000 + 10000))
              }
              disabled={!currentSong}
              style={styles.seekButton}
            />
          </View>
        </View>

        {/* Status Info */}
        <View style={styles.statusCard}>
          <Text style={styles.statusCardTitle}>Playback Info</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Position</Text>
            <Text style={styles.statusValue}>
              {formatDuration(position)} / {formatDuration(duration)}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>State</Text>
            <Text style={styles.statusValue}>
              {isPlaying ? '▶ Playing' : isLoading ? '⏳ Loading' : '⏸ Paused'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  statusPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  statusPlaying: {
    backgroundColor: colors.secondary + '25',
    borderWidth: 1,
    borderColor: colors.secondary + '60',
  },
  statusLoading: {
    backgroundColor: colors.primary + '25',
    borderWidth: 1,
    borderColor: colors.primary + '60',
  },
  statusPaused: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.backgroundTertiary,
  },
  statusText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  songCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.backgroundTertiary,
    ...shadows.medium,
  },
  songArtPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.xlarge,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  musicEmoji: {
    fontSize: 48,
  },
  songName: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  artistName: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  spinner: {
    marginVertical: spacing.md,
  },
  errorSection: {
    width: '100%',
  },
  progress: {
    width: '100%',
    marginTop: spacing.sm,
  },
  controlsCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.large,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.backgroundTertiary,
  },
  seekRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  seekButton: {
    flex: 1,
  },
  loadButton: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.large,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.backgroundTertiary,
    gap: spacing.sm,
  },
  statusCardTitle: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
    paddingBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    ...typography.body,
    color: colors.textMuted,
  },
  statusValue: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
