/**
 * PlayerScreen – Figma-matched full-screen music player
 *
 * Design matches:
 *  - Back arrow (←) top-left, 3-dot menu top-right
 *  - Large album art with rounded corners
 *  - Song title + artist centered below art
 *  - Orange progress bar / slider
 *  - Controls: prev | rewind 10 (clock icon) | play/pause (orange circle) | forward 10 (clock icon) | next
 *  - Bottom row: shuffle, timer, cast, more
 *  - "Lyrics" pull-up at very bottom
 *  - Double-tap entire upper section to seek ±10s with animated effect
 */

import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Image,
  GestureResponderEvent,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SharedValue,
} from 'react-native-reanimated';
import type { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography, borderRadius } from '../theme';
import { ProgressBar } from '../components/player/ProgressBar';
import { SongOptionsModal } from '../components/song/SongOptionsModal';
import { usePlayerStore } from '../store/playerStore';
import { useQueueStore, RepeatMode } from '../store/queueStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { useHistoryStore } from '../store/historyStore';
import { useDownloadStore } from '../store/downloadStore';
import { getImageUrl, getArtistNames } from '../utils/audio';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ARTWORK_SIZE = SCREEN_WIDTH * 0.78;
const SEEK_SECONDS = 10;

type Props = StackScreenProps<RootStackParamList, 'Player'>;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// ────────────────────────────────────────
// YouTube-style Double-tap Seek Feedback
// Cascading chevrons + curved overlay + ripple
// ────────────────────────────────────────
const SeekChevron: React.FC<{
  delay: number;
  direction: 'left' | 'right';
  triggerCount: number;
}> = ({ delay, direction, triggerCount }) => {
  const chevronOpacity = useSharedValue(0);
  const chevronTranslateX = useSharedValue(0);

  useEffect(() => {
    if (triggerCount > 0) {
      chevronOpacity.value = 0;
      chevronTranslateX.value = 0;

      const moveDir = direction === 'right' ? 8 : -8;

      chevronOpacity.value = withDelay(
        delay,
        withSequence(
          withTiming(1, { duration: 100 }),
          withTiming(0.3, { duration: 150 }),
          withTiming(1, { duration: 100 }),
          withDelay(100, withTiming(0, { duration: 200 })),
        ),
      );
      chevronTranslateX.value = withDelay(
        delay,
        withSequence(
          withTiming(moveDir, { duration: 250, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 200 }),
        ),
      );
    }
  }, [triggerCount]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: chevronOpacity.value,
    transform: [{ translateX: chevronTranslateX.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Ionicons
        name={direction === 'left' ? 'play-back' : 'play-forward'}
        size={18}
        color="rgba(255,255,255,0.9)"
      />
    </Animated.View>
  );
};

const AnimatedSeekFeedback: React.FC<{
  side: 'left' | 'right';
  triggerCount: number;
}> = ({ side, triggerCount }) => {
  const overlayOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textScale = useSharedValue(0.7);
  const ripple1Scale = useSharedValue(0);
  const ripple1Opacity = useSharedValue(0);
  const ripple2Scale = useSharedValue(0);
  const ripple2Opacity = useSharedValue(0);

  useEffect(() => {
    if (triggerCount > 0) {
      // Reset all
      overlayOpacity.value = 0;
      textOpacity.value = 0;
      textScale.value = 0.7;
      ripple1Scale.value = 0;
      ripple1Opacity.value = 0;
      ripple2Scale.value = 0;
      ripple2Opacity.value = 0;

      // Dark overlay fade in/out
      overlayOpacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(500, withTiming(0, { duration: 250 })),
      );

      // Text label spring in, then fade out
      textOpacity.value = withSequence(
        withTiming(1, { duration: 120 }),
        withDelay(450, withTiming(0, { duration: 200 })),
      );
      textScale.value = withSequence(
        withSpring(1, { damping: 10, stiffness: 180, mass: 0.8 }),
        withDelay(350, withTiming(0.9, { duration: 150 })),
      );

      // Ripple ring 1 (fast)
      ripple1Opacity.value = withSequence(
        withTiming(0.6, { duration: 80 }),
        withTiming(0, { duration: 500 }),
      );
      ripple1Scale.value = withTiming(1, {
        duration: 550,
        easing: Easing.out(Easing.cubic),
      });

      // Ripple ring 2 (delayed, slower — creates concentric effect)
      ripple2Opacity.value = withDelay(
        100,
        withSequence(
          withTiming(0.4, { duration: 80 }),
          withTiming(0, { duration: 600 }),
        ),
      );
      ripple2Scale.value = withDelay(
        100,
        withTiming(1, {
          duration: 650,
          easing: Easing.out(Easing.cubic),
        }),
      );
    }
  }, [triggerCount]);

  const overlayAnimStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const textAnimStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ scale: textScale.value }],
  }));

  const ripple1AnimStyle = useAnimatedStyle(() => ({
    opacity: ripple1Opacity.value,
    transform: [{ scale: ripple1Scale.value }],
  }));

  const ripple2AnimStyle = useAnimatedStyle(() => ({
    opacity: ripple2Opacity.value,
    transform: [{ scale: ripple2Scale.value }],
  }));

  return (
    <View
      style={[
        styles.seekFeedback,
        side === 'left' ? styles.seekFeedbackLeft : styles.seekFeedbackRight,
      ]}
      pointerEvents="none"
    >
      {/* Curved dark overlay */}
      <Animated.View
        style={[
          styles.seekOverlay,
          side === 'left' ? styles.seekOverlayLeft : styles.seekOverlayRight,
          overlayAnimStyle,
        ]}
      />

      {/* Concentric ripple rings */}
      <Animated.View style={[styles.seekRippleRing, ripple1AnimStyle]} />
      <Animated.View style={[styles.seekRippleRing, styles.seekRippleRing2, ripple2AnimStyle]} />

      {/* Chevrons + Text */}
      <Animated.View style={[styles.seekFeedbackContent, textAnimStyle]}>
        {/* Cascading triple chevrons */}
        <View style={styles.chevronsRow}>
          <SeekChevron delay={0} direction={side} triggerCount={triggerCount} />
          <SeekChevron delay={60} direction={side} triggerCount={triggerCount} />
          <SeekChevron delay={120} direction={side} triggerCount={triggerCount} />
        </View>
        <Text style={styles.seekFeedbackText}>
          {side === 'left' ? '-' : '+'}
          {SEEK_SECONDS} seconds
        </Text>
      </Animated.View>
    </View>
  );
};

export const PlayerScreen: React.FC<Props> = ({ route, navigation }) => {
  const {
    currentSong,
    isPlaying,
    isLoading,
    position,
    duration,
    play,
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
    addToQueue,
  } = useQueueStore();

  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { addToHistory } = useHistoryStore();
  const { 
    downloadSong, 
    isDownloaded, 
    isDownloading, 
    getProgress,
    deleteDownload 
  } = useDownloadStore();

  // ── Modal state ──
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  // ── Shared animation values ──
  const artworkScale = useSharedValue(1);
  const playBtnScale = useSharedValue(1);

  // ── Double-tap state ──
  const lastTapTimeRef = useRef<number>(0);
  const lastTapSideRef = useRef<'left' | 'right' | null>(null);
  const [seekLeftCount, setSeekLeftCount] = useState(0);
  const [seekRightCount, setSeekRightCount] = useState(0);

  // Initialize with song from route params
  useEffect(() => {
    if (route.params?.song && (!currentSong || currentSong.id !== route.params.song.id)) {
      play(route.params.song);
    }
  }, [route.params?.song]);

  // Track song in history when it starts playing
  useEffect(() => {
    if (currentSong && isPlaying) {
      addToHistory(currentSong);
    }
  }, [currentSong?.id, isPlaying]);

  // ── Artwork breathing animation when playing ──
  useEffect(() => {
    if (isPlaying) {
      artworkScale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    } else {
      artworkScale.value = withSpring(1, { damping: 15 });
    }
  }, [isPlaying]);

  const artworkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: artworkScale.value }],
  }));

  // ── Button press feedback ──
  const animatePress = useCallback((sv: SharedValue<number>) => {
    sv.value = withSequence(
      withTiming(0.88, { duration: 80 }),
      withSpring(1, { damping: 12 }),
    );
  }, []);

  const playBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playBtnScale.value }],
  }));

  // ── Handlers ──
  const handleNext = async () => {
    const next = nextSong();
    if (next) await play(next);
  };

  const handlePrevious = async () => {
    if (position > 3) {
      await seekTo(0);
    } else {
      const prev = previousSong();
      if (prev) await play(prev);
    }
  };

  const handleSeek = async (positionMs: number) => {
    await seekTo(positionMs / 1000);
  };

  const handleSeekForward = async () => {
    const newPos = Math.min(position + SEEK_SECONDS, duration);
    await seekTo(newPos);
  };

  const handleSeekBackward = async () => {
    const newPos = Math.max(position - SEEK_SECONDS, 0);
    await seekTo(newPos);
  };

  // ── Double-tap on upper section (header + artwork) ──
  const handleUpperSectionPress = (evt: GestureResponderEvent) => {
    const now = Date.now();
    const tapX = evt.nativeEvent.pageX; // Use pageX for absolute position
    const side: 'left' | 'right' = tapX < SCREEN_WIDTH / 2 ? 'left' : 'right';
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapTimeRef.current < DOUBLE_TAP_DELAY && lastTapSideRef.current === side) {
      if (side === 'left') {
        handleSeekBackward();
        setSeekLeftCount((c) => c + 1);
      } else {
        handleSeekForward();
        setSeekRightCount((c) => c + 1);
      }
      lastTapTimeRef.current = 0;
    } else {
      lastTapTimeRef.current = now;
      lastTapSideRef.current = side;
    }
  };

  const handleRepeatToggle = () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const idx = modes.indexOf(repeat);
    setRepeat(modes[(idx + 1) % modes.length]);
  };

  const handleLikeToggle = () => {
    if (currentSong) {
      toggleFavorite(currentSong);
    }
  };

  const handleAddToQueue = () => {
    if (currentSong) {
      addToQueue(currentSong, true); // Add as manual
    }
  };

  const handleAddToPlaylist = () => {
    if (currentSong) {
      // Add to queue (playlist functionality)
      addToQueue(currentSong, true); // Add as manual
    }
  };

  const handleDownloadToggle = async () => {
    if (!currentSong) return;

    if (isDownloaded(currentSong.id)) {
      // Delete download
      await deleteDownload(currentSong.id);
    } else if (!isDownloading(currentSong.id)) {
      // Start download
      await downloadSong(currentSong);
    }
  };

  const getRepeatIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (repeat) {
      case 'one':  return 'repeat-outline'; // Will show with badge/different styling
      case 'all':  return 'repeat';
      default:     return 'repeat-outline';
    }
  };

  const getRepeatBadge = (): string | null => {
    return repeat === 'one' ? '1' : null;
  };

  // ── Empty state ──
  if (!currentSong) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="musical-notes-outline" size={72} color={colors.textMuted} />
          <Text style={styles.emptyText}>No song playing</Text>
        </View>
      </View>
    );
  }

  const albumArtUrl = getImageUrl(currentSong.image, '500x500');
  const artistNames = getArtistNames(currentSong);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Background ── */}
      <View style={StyleSheet.absoluteFill}>
        <View style={styles.backgroundDark} />
      </View>

      {/* ── Upper Section: Header + Artwork (Double-tap to seek) ── */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleUpperSectionPress}
        style={styles.upperSection}
      >
        {/* ── Header: Back arrow + 3-dot menu ── */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(100)}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity 
            style={styles.headerBtn} 
            activeOpacity={0.7}
            onPress={() => setShowOptionsModal(true)}
          >
            <Ionicons name="ellipsis-horizontal" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </Animated.View>

        {/* ── Artwork ── */}
        <Animated.View
          entering={FadeIn.duration(500).delay(200)}
          style={styles.artworkSection}
        >
          <Animated.View style={[styles.artworkWrapper, artworkAnimStyle]}>
            <View style={styles.artworkInner}>
              {albumArtUrl ? (
                <Image
                  source={{ uri: albumArtUrl }}
                  style={styles.artwork}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.artwork, styles.artworkPlaceholder]}>
                  <Ionicons name="musical-notes-outline" size={80} color={colors.textMuted} />
                </View>
              )}
            </View>
          </Animated.View>
        </Animated.View>

        {/* Animated seek feedback overlays */}
        <AnimatedSeekFeedback side="left" triggerCount={seekLeftCount} />
        <AnimatedSeekFeedback side="right" triggerCount={seekRightCount} />
      </TouchableOpacity>

      {/* ── Bottom: Info + Controls ── */}
      <View style={styles.controlsSection}>
        {/* Song Info */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(300)}
          style={styles.infoContainer}
        >
          <Text style={styles.songTitle} numberOfLines={2}>
            {currentSong.name}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {artistNames}
          </Text>
        </Animated.View>

        {/* Progress Bar */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(350)}
          style={styles.progressContainer}
        >
          <ProgressBar
            currentPosition={position * 1000}
            duration={duration * 1000}
            onSeek={handleSeek}
            showTimeLabels={true}
          />
        </Animated.View>

        {/* Main Controls: prev | rewind10 | play/pause | forward10 | next */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(400)}
          style={styles.mainControls}
        >
          {/* Previous */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handlePrevious}
            activeOpacity={0.7}
          >
            <Ionicons name="play-skip-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Rewind 10s — clock-rotation icon (mirrored reload) */}
          <TouchableOpacity
            style={styles.seekButton}
            onPress={handleSeekBackward}
            activeOpacity={0.7}
          >
            <View style={styles.seekIconContainer}>
              <Ionicons
                name="reload-outline"
                size={26}
                color={colors.textSecondary}
                style={{ transform: [{ scaleX: -1 }] }}
              />
              <Text style={styles.seekBtnLabelCenter}>10</Text>
            </View>
          </TouchableOpacity>

          {/* Play / Pause — large orange circle */}
          <AnimatedTouchable
            style={[styles.playButton, playBtnAnimStyle]}
            onPress={() => {
              animatePress(playBtnScale);
              togglePlayPause();
            }}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            <View style={styles.playButtonInner}>
              {isLoading ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={32}
                  color={colors.backgroundPrimary}
                  style={!isPlaying ? { marginLeft: 3 } : undefined}
                />
              )}
            </View>
          </AnimatedTouchable>

          {/* Forward 10s — clock-rotation icon */}
          <TouchableOpacity
            style={styles.seekButton}
            onPress={handleSeekForward}
            activeOpacity={0.7}
          >
            <View style={styles.seekIconContainer}>
              <Ionicons
                name="reload-outline"
                size={26}
                color={colors.textSecondary}
              />
              <Text style={styles.seekBtnLabelCenter}>10</Text>
            </View>
          </TouchableOpacity>

          {/* Next */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleNext}
            activeOpacity={0.7}
          >
            <Ionicons name="play-skip-forward" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom Actions: shuffle, repeat, download, like, queue */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(450)}
          style={styles.bottomActions}
        >
          <TouchableOpacity style={styles.bottomBtn} onPress={toggleShuffle} activeOpacity={0.7}>
            <Ionicons
              name={shuffle ? 'shuffle' : 'shuffle-outline'}
              size={22}
              color={shuffle ? colors.secondary : colors.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomBtn} onPress={handleRepeatToggle} activeOpacity={0.7}>
            <View style={styles.iconWithBadge}>
              <Ionicons
                name={getRepeatIcon()}
                size={22}
                color={repeat !== 'off' ? colors.secondary : colors.textMuted}
              />
              {getRepeatBadge() && (
                <View style={styles.repeatBadge}>
                  <Text style={styles.repeatBadgeText}>{getRepeatBadge()}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Download Button with Progress */}
          <TouchableOpacity 
            style={styles.bottomBtn} 
            activeOpacity={0.7}
            onPress={handleDownloadToggle}
          >
            {isDownloading(currentSong.id) ? (
              <View style={styles.downloadProgressContainer}>
                <View style={styles.downloadProgressBg}>
                  <View 
                    style={[
                      styles.downloadProgressFill, 
                      { width: `${getProgress(currentSong.id)}%` }
                    ]} 
                  />
                </View>
                <Ionicons 
                  name="download-outline" 
                  size={22} 
                  color={colors.textMuted} 
                />
              </View>
            ) : (
              <Ionicons 
                name={isDownloaded(currentSong.id) ? 'checkmark-circle' : 'download-outline'} 
                size={22} 
                color={isDownloaded(currentSong.id) ? colors.secondary : colors.textMuted} 
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.bottomBtn} 
            activeOpacity={0.7}
            onPress={handleLikeToggle}
          >
            <Ionicons 
              name={currentSong && isFavorite(currentSong.id) ? 'heart' : 'heart-outline'} 
              size={22} 
              color={currentSong && isFavorite(currentSong.id) ? colors.primary : colors.textMuted} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.bottomBtn} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Queue')}
          >
            <Ionicons name="list" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </Animated.View>

        {/* Lyrics pull-up */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(500)}
          style={styles.lyricsSection}
        >
          <TouchableOpacity 
            style={styles.lyricsButton}
            onPress={() => setShowLyrics(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-up" size={20} color={colors.textMuted} />
            <Text style={styles.lyricsLabel}>Lyrics</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Song Options Modal */}
      <SongOptionsModal
        visible={showOptionsModal}
        song={currentSong}
        onClose={() => setShowOptionsModal(false)}
        onAddToQueue={handleAddToQueue}
        onAddToPlaylist={handleAddToPlaylist}
      />

      {/* Lyrics Modal */}
      <Modal
        visible={showLyrics}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLyrics(false)}
      >
        <View style={styles.lyricsModal}>
          <StatusBar barStyle="light-content" />
          
          {/* Lyrics Header */}
          <View style={styles.lyricsHeader}>
            <TouchableOpacity
              style={styles.lyricsCloseButton}
              onPress={() => setShowLyrics(false)}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-down" size={28} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.lyricsHeaderTitle}>Lyrics</Text>
            <View style={styles.lyricsHeaderRight} />
          </View>

          {/* Song Info in Lyrics */}
          <View style={styles.lyricsSongInfo}>
            <Image
              source={{ uri: albumArtUrl }}
              style={styles.lyricsAlbumArt}
            />
            <Text style={styles.lyricsSongTitle} numberOfLines={1}>
              {currentSong.name}
            </Text>
            <Text style={styles.lyricsArtistName} numberOfLines={1}>
              {artistNames}
            </Text>
          </View>

          {/* Lyrics Content */}
          <ScrollView
            style={styles.lyricsScrollView}
            contentContainerStyle={styles.lyricsContent}
            showsVerticalScrollIndicator={false}
          >
            {currentSong.hasLyrics === false ? (
              <View style={styles.noLyricsContainer}>
                <Ionicons name="musical-notes-outline" size={64} color={colors.textMuted} />
                <Text style={styles.noLyricsText}>Lyrics not available</Text>
                <Text style={styles.noLyricsSubtext}>
                  Lyrics for this song are not available at the moment
                </Text>
              </View>
            ) : currentSong.lyricsSnippet ? (
              <>
                <Text style={styles.lyricsText}>
                  {currentSong.lyricsSnippet}
                </Text>
                <View style={styles.lyricsFooter}>
                  <Ionicons name="musical-note" size={16} color={colors.textMuted} />
                  <Text style={styles.lyricsFooterText}>
                    Lyrics powered by JioSaavn
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.noLyricsContainer}>
                <Ionicons name="time-outline" size={64} color={colors.textMuted} />
                <Text style={styles.noLyricsText}>Loading lyrics...</Text>
                <Text style={styles.noLyricsSubtext}>
                  Lyrics will appear here when available
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },

  // ── Background ──
  backgroundDark: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.backgroundPrimary,
  },

  // ── Upper Section (Header + Artwork — double-tap zone) ──
  upperSection: {
    flex: 1,
    position: 'relative',
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: (StatusBar.currentHeight ?? 24) + 12,
    paddingBottom: 4,
    gap: spacing.sm,
    zIndex: 10,
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Artwork section ──
  artworkSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkWrapper: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkInner: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: borderRadius.xlarge,
    overflow: 'hidden',
  },
  artwork: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.xlarge,
  },
  artworkPlaceholder: {
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Double-tap seek feedback (covers half the upper section) ──
  seekFeedback: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  seekFeedbackLeft: {
    left: 0,
  },
  seekFeedbackRight: {
    right: 0,
  },
  seekOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  seekOverlayLeft: {
    borderTopRightRadius: SCREEN_WIDTH * 0.5,
    borderBottomRightRadius: SCREEN_WIDTH * 0.5,
  },
  seekOverlayRight: {
    borderTopLeftRadius: SCREEN_WIDTH * 0.5,
    borderBottomLeftRadius: SCREEN_WIDTH * 0.5,
  },
  seekFeedbackContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  chevronsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 6,
  },
  seekFeedbackText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: 'rgba(255,255,255,0.95)',
  },
  seekRippleRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(255, 140, 40, 0.5)',
    backgroundColor: 'transparent',
  },
  seekRippleRing2: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderColor: 'rgba(255, 140, 40, 0.25)',
  },

  // ── Controls section (bottom) ──
  controlsSection: {
    paddingBottom: spacing.sm,
  },

  // ── Song Info ──
  infoContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  songTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 28,
  },
  artistName: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
  },

  // ── Progress ──
  progressContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },

  // ── Main Controls ──
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  skipButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seekButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seekIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  seekBtnLabelCenter: {
    fontSize: 9,
    fontFamily: 'Poppins_700Bold',
    color: colors.textSecondary,
    position: 'absolute',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  playButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Bottom actions ──
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  bottomBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWithBadge: {
    position: 'relative',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repeatBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repeatBadgeText: {
    fontSize: 9,
    fontFamily: 'Poppins_700Bold',
    color: colors.backgroundPrimary,
  },
  downloadProgressContainer: {
    position: 'relative',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadProgressBg: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    overflow: 'hidden',
  },
  downloadProgressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    opacity: 0.3,
  },

  // ── Lyrics section ──
  lyricsSection: {
    alignItems: 'center',
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  lyricsButton: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  lyricsLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: colors.textMuted,
    marginTop: 2,
  },

  // ── Lyrics Modal ──
  lyricsModal: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  lyricsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: (StatusBar.currentHeight ?? 24) + 12,
    paddingBottom: spacing.md,
  },
  lyricsCloseButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lyricsHeaderTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
  },
  lyricsHeaderRight: {
    width: 44,
  },
  lyricsSongInfo: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  lyricsAlbumArt: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.large,
    marginBottom: spacing.md,
  },
  lyricsSongTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  lyricsArtistName: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
  },
  lyricsScrollView: {
    flex: 1,
  },
  lyricsContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  lyricsText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: colors.textPrimary,
    lineHeight: 28,
    textAlign: 'center',
  },
  lyricsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  lyricsFooterText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
  },
  noLyricsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  noLyricsText: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textMuted,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  noLyricsSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Empty ──
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
