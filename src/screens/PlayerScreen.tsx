import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { AlbumArt } from '../components/song/AlbumArt';
import { ProgressBar } from '../components/player/ProgressBar';
import { usePlayerStore } from '../store/playerStore';
import { useQueueStore, RepeatMode } from '../store/queueStore';
import { getImageUrl, getArtistNames } from '../utils/audio';

type Props = StackScreenProps<RootStackParamList, 'Player'>;

export const PlayerScreen: React.FC<Props> = ({ route, navigation }) => {
  const {
    currentSong,
    isPlaying,
    isLoading,
    position,
    duration,
    play,
    pause,
    togglePlayPause,
    seekTo,
  } = usePlayerStore();

  const {
    shuffle,
    repeat,
    toggleShuffle,
    setRepeat,
    nextSong,
    previousSong,
  } = useQueueStore();

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Initialize with song from route params if provided
  useEffect(() => {
    if (route.params?.song && (!currentSong || currentSong.id !== route.params.song.id)) {
      play(route.params.song);
    }
  }, [route.params?.song]);

  const handleNext = async () => {
    const next = nextSong();
    if (next) {
      await play(next);
    }
  };

  const handlePrevious = async () => {
    // If more than 3 seconds into the song, restart it
    if (position > 3) {
      await seekTo(0);
    } else {
      const prev = previousSong();
      if (prev) {
        await play(prev);
      }
    }
  };

  const handleSeek = async (positionMs: number) => {
    await seekTo(positionMs / 1000); // Convert ms to seconds
  };

  const handleRepeatToggle = () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeat);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeat(modes[nextIndex]);
  };

  const handleDownload = () => {
    // TODO: Implement download functionality in task 15
    setIsDownloading(true);
    // Simulate download progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setDownloadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsDownloading(false);
        setDownloadProgress(0);
      }
    }, 200);
  };

  const handleQueuePress = () => {
    // Close the player modal and navigate to Playlists tab
    navigation.goBack();
    // Note: User can access queue from Playlists tab
    // In a future enhancement, we could use a separate Queue screen
  };

  const getRepeatIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (repeat) {
      case 'one':
        return 'repeat-outline'; // Will show as repeat-one with custom styling
      case 'all':
        return 'repeat';
      default:
        return 'repeat-outline';
    }
  };

  if (!currentSong) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-down" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="musical-notes" size={64} color={colors.textMuted} />
          <Text style={styles.emptyText}>No song playing</Text>
        </View>
      </SafeAreaView>
    );
  }

  const albumArtUrl = getImageUrl(currentSong.image, '500x500');
  const artistNames = getArtistNames(currentSong);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-down" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Now Playing</Text>
          <View style={styles.backButton} />
        </View>

        {/* Album Artwork */}
        <View style={styles.artworkContainer}>
          <AlbumArt uri={albumArtUrl} size="player" style={styles.artwork} />
        </View>

        {/* Song Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.songTitle} numberOfLines={2}>
            {currentSong.name}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {artistNames}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <ProgressBar
            currentPosition={position * 1000} // Convert seconds to ms
            duration={duration * 1000} // Convert seconds to ms
            onSeek={handleSeek}
            showTimeLabels={true}
          />
        </View>

        {/* Main Playback Controls */}
        <View style={styles.mainControls}>
          <TouchableOpacity
            style={styles.secondaryControlButton}
            onPress={handlePrevious}
            activeOpacity={0.7}
          >
            <Ionicons name="play-skip-back" size={28} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.playButtonActive]}
            onPress={togglePlayPause}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color={colors.backgroundPrimary} />
            ) : (
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={36}
                color={isPlaying ? colors.backgroundPrimary : colors.textPrimary}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryControlButton}
            onPress={handleNext}
            activeOpacity={0.7}
          >
            <Ionicons name="play-skip-forward" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Secondary Controls */}
        <View style={styles.secondaryControls}>
          {/* Shuffle Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleShuffle}
            activeOpacity={0.7}
          >
            <Ionicons
              name="shuffle"
              size={24}
              color={shuffle ? colors.secondary : colors.textMuted}
            />
          </TouchableOpacity>

          {/* Repeat Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleRepeatToggle}
            activeOpacity={0.7}
          >
            <View style={styles.repeatButtonContent}>
              <Ionicons
                name={getRepeatIcon()}
                size={24}
                color={repeat !== 'off' ? colors.secondary : colors.textMuted}
              />
              {repeat === 'one' && (
                <Text style={styles.repeatOneText}>1</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Download Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleDownload}
            activeOpacity={0.7}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <View style={styles.downloadProgress}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.downloadProgressText}>{downloadProgress}%</Text>
              </View>
            ) : (
              <Ionicons
                name="download-outline"
                size={24}
                color={colors.textMuted}
              />
            )}
          </TouchableOpacity>

          {/* Queue Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleQueuePress}
            activeOpacity={0.7}
          >
            <Ionicons name="list" size={24} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontFamily: 'Poppins_500Medium',
  },
  artworkContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  artwork: {
    ...shadows.large,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  songTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  artistName: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: spacing.xl,
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  secondaryControlButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.round,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.medium,
  },
  playButtonActive: {
    backgroundColor: colors.primary,
  },
  secondaryControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xl,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repeatButtonContent: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  repeatOneText: {
    position: 'absolute',
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.secondary,
    bottom: -2,
  },
  downloadProgress: {
    alignItems: 'center',
  },
  downloadProgressText: {
    fontSize: 8,
    color: colors.primary,
    marginTop: 2,
    fontFamily: 'Poppins_600SemiBold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});
