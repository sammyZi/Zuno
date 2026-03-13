/**
 * Mini Player Component
 * Persistent bottom bar with smooth Reanimated animations
 *
 * NOTE: This component lives OUTSIDE the Stack.Navigator, so it cannot
 * use useNavigation/useRoute hooks. It receives `currentRouteName` as a
 * prop and uses the shared `navigationRef` for navigation.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePlayerStore } from '../../store/playerStore';
import { useQueueStore } from '../../store/queueStore';
import { colors, spacing, borderRadius } from '../../theme';
import { navigate } from '../../navigation/navigationRef';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface MiniPlayerProps {
  currentRouteName?: string;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ currentRouteName }) => {
  const slideY = useSharedValue(120);
  const playBtnScale = useSharedValue(1);
  const progressWidth = useSharedValue(0);

  const { currentSong, isPlaying, position, duration, play, togglePlayPause } = usePlayerStore();
  const { nextSong } = useQueueStore();

  const isPlayerScreen = currentRouteName === 'Player';

  // ── Slide animation ──
  useEffect(() => {
    if (currentSong && !isPlayerScreen) {
      slideY.value = withSpring(0, {
        damping: 18,
        stiffness: 120,
        mass: 0.8,
      });
    } else {
      slideY.value = withTiming(120, { duration: 250 });
    }
  }, [currentSong, isPlayerScreen]);

  // ── Progress tracking ──
  useEffect(() => {
    if (duration > 0) {
      const pct = Math.min((position / duration) * 100, 100);
      progressWidth.value = withTiming(pct, { duration: 900 });
    }
  }, [position, duration]);

  const containerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideY.value }],
    opacity: interpolate(slideY.value, [0, 80], [1, 0], Extrapolation.CLAMP),
  }));

  const progressAnimStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%` as any,
  }));

  const playBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playBtnScale.value }],
  }));

  if (!currentSong || isPlayerScreen) {
    return null;
  }

  const albumArtUrl =
    currentSong.image.find((img) => img.quality === '500x500')?.url ||
    currentSong.image[currentSong.image.length - 1]?.url;

  const artistName = currentSong.artists.primary[0]?.name || 'Unknown Artist';

  const handlePress = () => {
    navigate('Player', { song: currentSong });
  };

  const handlePlayPause = async () => {
    playBtnScale.value = withSequence(
      withTiming(0.8, { duration: 60 }),
      withSpring(1, { damping: 12 }),
    );
    await togglePlayPause();
  };

  return (
    <Animated.View style={[styles.container, containerAnimStyle]}>
      {/* Progress indicator at top */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressAnimStyle]} />
      </View>

      <TouchableOpacity
        style={styles.content}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {/* Album Art with rounded corners */}
        <View style={styles.albumArtContainer}>
          {albumArtUrl ? (
            <Image
              source={{ uri: albumArtUrl }}
              style={styles.albumArt}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.albumArt, styles.albumArtPlaceholder]}>
              <Ionicons name="musical-notes-outline" size={18} color={colors.textMuted} />
            </View>
          )}
        </View>

        {/* Song Info */}
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1} ellipsizeMode="tail">
            {currentSong.name}
          </Text>
          <Text style={styles.artistText} numberOfLines={1} ellipsizeMode="tail">
            {artistName}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <AnimatedTouchable
            style={[styles.playButton, playBtnAnimStyle]}
            onPress={handlePlayPause}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primaryLight, colors.primary]}
              style={styles.playButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={18}
                color="#fff"
                style={!isPlaying ? { marginLeft: 2 } : undefined}
              />
            </LinearGradient>
          </AnimatedTouchable>

          <TouchableOpacity style={styles.nextButton} onPress={async () => {
            const next = nextSong();
            if (next) await play(next);
          }} activeOpacity={0.7}>
            <Ionicons name="play-skip-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 70,
    left: 8,
    right: 8,
    height: 68,
    backgroundColor: 'rgba(30, 33, 42, 0.97)',
    borderRadius: 16,
    overflow: 'hidden',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 12,
    // Subtle border
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  progressTrack: {
    height: 2.5,
    backgroundColor: 'rgba(255,255,255,0.06)',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  albumArtContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  albumArt: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: colors.backgroundTertiary,
  },
  albumArtPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    justifyContent: 'center',
  },
  songTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 1,
  },
  artistText: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  playButtonGradient: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
