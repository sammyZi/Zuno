/**
 * PlayerScreen – Premium full-screen music player
 *
 * Features:
 *  - Animated album art with breathing pulse when playing
 *  - Smooth slide-up entrance via Reanimated
 *  - Double-tap on artwork left/right half to seek ±10s
 *  - Seek buttons (rewind/forward 10s)
 *  - Lit-up bottom action buttons with labels
 *  - Beautiful gradient background
 *  - Micro-interaction feedback on all buttons
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
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography, borderRadius } from '../theme';
import { ProgressBar } from '../components/player/ProgressBar';
import { usePlayerStore } from '../store/playerStore';
import { useQueueStore, RepeatMode } from '../store/queueStore';
import { getImageUrl, getArtistNames } from '../utils/audio';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ARTWORK_SIZE = SCREEN_WIDTH * 0.75;
const SEEK_SECONDS = 10;

type Props = StackScreenProps<RootStackParamList, 'Player'>;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// ────────────────────────────────────────
// Double-tap seek overlay feedback
// ────────────────────────────────────────
const SeekFeedback: React.FC<{ side: 'left' | 'right'; visible: boolean }> = ({
  side,
  visible,
}) => {
  if (!visible) return null;
  return (
    <View
      style={[
        styles.seekFeedback,
        side === 'left' ? styles.seekFeedbackLeft : styles.seekFeedbackRight,
      ]}
    >
      <Ionicons
        name={side === 'left' ? 'play-back' : 'play-forward'}
        size={28}
        color="rgba(255,255,255,0.9)"
      />
      <Text style={styles.seekFeedbackText}>
        {side === 'left' ? '-' : '+'}
        {SEEK_SECONDS}s
      </Text>
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
  } = useQueueStore();

  // ── Shared animation values ──
  const artworkScale = useSharedValue(1);
  const playBtnScale = useSharedValue(1);

  // ── Double-tap state ──
  const lastTapTimeRef = useRef<number>(0);
  const lastTapSideRef = useRef<'left' | 'right' | null>(null);
  const [seekFeedbackSide, setSeekFeedbackSide] = useState<'left' | 'right' | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize with song from route params
  useEffect(() => {
    if (route.params?.song && (!currentSong || currentSong.id !== route.params.song.id)) {
      play(route.params.song);
    }
  }, [route.params?.song]);

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

  // ── Double-tap on artwork ──
  const handleArtworkPress = (evt: GestureResponderEvent) => {
    const now = Date.now();
    const tapX = evt.nativeEvent.locationX;
    const side: 'left' | 'right' = tapX < ARTWORK_SIZE / 2 ? 'left' : 'right';
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapTimeRef.current < DOUBLE_TAP_DELAY && lastTapSideRef.current === side) {
      // Double tap detected!
      if (side === 'left') {
        handleSeekBackward();
      } else {
        handleSeekForward();
      }

      // Show feedback
      setSeekFeedbackSide(side);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = setTimeout(() => setSeekFeedbackSide(null), 600);

      lastTapTimeRef.current = 0; // Reset
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

  const getRepeatIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (repeat) {
      case 'one':  return 'repeat-outline';
      case 'all':  return 'repeat';
      default:     return 'repeat-outline';
    }
  };

  // ── Empty state ──
  if (!currentSong) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <LinearGradient
          colors={['#1a1c24', colors.backgroundPrimary]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-down-outline" size={26} color={colors.textPrimary} />
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

      {/* ── Dynamic gradient background ── */}
      <LinearGradient
        colors={['#2a1810', '#1a1020', colors.backgroundPrimary]}
        locations={[0, 0.4, 0.85]}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Header ── */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(100)}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-down-outline" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>NOW PLAYING</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </Animated.View>

      {/* ── Top section: Artwork (takes remaining space) ── */}
      <Animated.View
        entering={FadeIn.duration(500).delay(200)}
        style={styles.artworkSection}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleArtworkPress}
          style={styles.artworkTouchable}
        >
          <Animated.View style={[styles.artworkWrapper, artworkAnimStyle]}>
            {/* Glow effect behind art */}
            <View style={styles.artworkGlow} />
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

          {/* Double-tap seek feedback overlays */}
          <SeekFeedback side="left" visible={seekFeedbackSide === 'left'} />
          <SeekFeedback side="right" visible={seekFeedbackSide === 'right'} />
        </TouchableOpacity>

        {/* Double-tap hint */}
        <Text style={styles.doubleTapHint}>Double-tap sides to seek ±{SEEK_SECONDS}s</Text>
      </Animated.View>

      {/* ── Bottom section: Info + Controls (fixed at bottom) ── */}
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

        {/* Main Controls */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(400)}
          style={styles.mainControls}
        >
          {/* Shuffle */}
          <TouchableOpacity
            style={styles.sideControl}
            onPress={toggleShuffle}
            activeOpacity={0.7}
          >
            <Ionicons
              name={shuffle ? 'shuffle' : 'shuffle-outline'}
              size={22}
              color={shuffle ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>

          {/* Previous */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handlePrevious}
            activeOpacity={0.7}
          >
            <Ionicons name="play-skip-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Rewind 10s */}
          <TouchableOpacity
            style={styles.seekButton}
            onPress={handleSeekBackward}
            activeOpacity={0.7}
          >
            <Ionicons name="play-back-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.seekBtnLabel}>10</Text>
          </TouchableOpacity>

          {/* Play / Pause */}
          <AnimatedTouchable
            style={[styles.playButton, playBtnAnimStyle]}
            onPress={() => {
              animatePress(playBtnScale);
              togglePlayPause();
            }}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[colors.primaryLight, colors.primary, colors.primaryDark]}
              style={styles.playButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isLoading ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={32}
                  color="#fff"
                  style={!isPlaying ? { marginLeft: 3 } : undefined}
                />
              )}
            </LinearGradient>
          </AnimatedTouchable>

          {/* Forward 10s */}
          <TouchableOpacity
            style={styles.seekButton}
            onPress={handleSeekForward}
            activeOpacity={0.7}
          >
            <Ionicons name="play-forward-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.seekBtnLabel}>10</Text>
          </TouchableOpacity>

          {/* Next */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleNext}
            activeOpacity={0.7}
          >
            <Ionicons name="play-skip-forward" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Repeat */}
          <TouchableOpacity
            style={styles.sideControl}
            onPress={handleRepeatToggle}
            activeOpacity={0.7}
          >
            <View>
              <Ionicons
                name={getRepeatIcon()}
                size={22}
                color={repeat !== 'off' ? colors.primary : colors.textMuted}
              />
              {repeat === 'one' && (
                <View style={styles.repeatOneBadge}>
                  <Text style={styles.repeatOneText}>1</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom Actions – Lit-up with labels */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(450)}
          style={styles.bottomActions}
        >
          <TouchableOpacity style={styles.bottomBtn} activeOpacity={0.7}>
            <View style={styles.bottomBtnInner}>
              <Ionicons name="heart-outline" size={22} color={colors.primary} />
            </View>
            <Text style={styles.bottomBtnLabel}>Like</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomBtn} activeOpacity={0.7}>
            <View style={styles.bottomBtnInner}>
              <Ionicons name="share-social-outline" size={22} color={colors.secondary} />
            </View>
            <Text style={styles.bottomBtnLabel}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomBtn}
            onPress={() => { navigation.goBack(); }}
            activeOpacity={0.7}
          >
            <View style={styles.bottomBtnInner}>
              <Ionicons name="list-outline" size={22} color="#A78BFA" />
            </View>
            <Text style={styles.bottomBtnLabel}>Queue</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomBtn} activeOpacity={0.7}>
            <View style={styles.bottomBtnInner}>
              <Ionicons name="download-outline" size={22} color="#60A5FA" />
            </View>
            <Text style={styles.bottomBtnLabel}>Save</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: (StatusBar.currentHeight ?? 24) + 8,
    paddingBottom: 4,
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 2,
    color: colors.textMuted,
  },

  // ── Artwork section (fills remaining space) ──
  artworkSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkTouchable: {
    position: 'relative',
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
  },
  artworkWrapper: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkGlow: {
    position: 'absolute',
    width: ARTWORK_SIZE * 0.85,
    height: ARTWORK_SIZE * 0.85,
    borderRadius: ARTWORK_SIZE / 2,
    backgroundColor: colors.primary,
    opacity: 0.12,
    top: ARTWORK_SIZE * 0.075,
    left: ARTWORK_SIZE * 0.075,
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

  // ── Double-tap seek feedback ──
  seekFeedback: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: borderRadius.xlarge,
  },
  seekFeedbackLeft: {
    left: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  seekFeedbackRight: {
    right: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  seekFeedbackText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  doubleTapHint: {
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.2)',
    marginTop: 8,
  },

  // ── Controls section (pinned to bottom) ──
  controlsSection: {
    paddingBottom: spacing.lg,
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
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  sideControl: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  seekButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    position: 'relative',
  },
  seekBtnLabel: {
    fontSize: 8,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textSecondary,
    position: 'absolute',
    bottom: 2,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginHorizontal: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  playButtonGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Repeat badge ──
  repeatOneBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: colors.primary,
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repeatOneText: {
    fontSize: 8,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },

  // ── Bottom actions (lit-up with labels) ──
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  bottomBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBtnInner: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  bottomBtnLabel: {
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
    marginTop: 4,
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
