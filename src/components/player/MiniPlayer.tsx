/**
 * Mini Player Component
 * Figma-matched persistent bottom mini-player bar
 * Shows: Song title + artist | pause/play + next button
 * Progress bar on top
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
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
} from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { usePlayerStore } from '../../store/playerStore';
import { useQueueStore } from '../../store/queueStore';
import { AudioService } from '../../services/audio';
import { colors, spacing, borderRadius } from '../../theme';
import { navigate } from '../../navigation/navigationRef';

const AnimatedTouchable = Animated.createAnimatedComponent(Pressable);

interface MiniPlayerProps {
  currentRouteName?: string;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ currentRouteName }) => {
  const slideY = useSharedValue(120);
  const playBtnScale = useSharedValue(1);
  const progressWidth = useSharedValue(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

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

      <Pressable
        style={styles.content}
        onPress={handlePress}
        
      >
        {/* Album Art */}
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
            {currentSong.name} - {artistName}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <AnimatedTouchable
            style={[styles.playButton, playBtnAnimStyle]}
            onPress={handlePlayPause}
            
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={20}
              color={colors.primary}
              style={!isPlaying ? { marginLeft: 2 } : undefined}
            />
          </AnimatedTouchable>

          <Pressable style={styles.nextButton} onPress={async () => {
            const next = nextSong();
            if (next) await play(next);
          }} >
            <Ionicons name="play-skip-forward" size={20} color={colors.primary} />
          </Pressable>
        </View>
      </Pressable>
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
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  progressTrack: {
    height: 2,
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
    width: 48,
    height: 48,
    borderRadius: 8,
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
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Poppins_500Medium',
    color: colors.textPrimary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

