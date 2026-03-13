/**
 * Mini Player Component
 * Persistent bottom bar showing current playback status
 * Syncs with playerStore and navigates to full Player screen on tap
 *
 * NOTE: This component lives OUTSIDE the Stack.Navigator (as a sibling
 * inside NavigationContainer) so it CANNOT use useNavigation / useRoute
 * hooks. Instead it receives `currentRouteName` as a prop from
 * AppNavigator and uses the shared `navigationRef` for programmatic
 * navigation.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayerStore } from '../../store/playerStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { navigate } from '../../navigation/navigationRef';

interface MiniPlayerProps {
  currentRouteName?: string;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ currentRouteName }) => {
  const slideAnim = useRef(new Animated.Value(100)).current;

  const { currentSong, isPlaying, togglePlayPause } = usePlayerStore();

  // Hide on Player screen
  const isPlayerScreen = currentRouteName === 'Player';

  // Slide-up animation when song starts
  useEffect(() => {
    if (currentSong && !isPlayerScreen) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [currentSong, isPlayerScreen, slideAnim]);

  // Don't render if no song or on Player screen
  if (!currentSong || isPlayerScreen) {
    return null;
  }

  // Get album art URL (highest quality available)
  const albumArtUrl = currentSong.image.find((img) => img.quality === '500x500')?.url || 
                      currentSong.image[currentSong.image.length - 1]?.url;

  // Get primary artist name
  const artistName = currentSong.artists.primary[0]?.name || 'Unknown Artist';

  const handlePress = () => {
    navigate('Player', { song: currentSong });
  };

  const handlePlayPause = async (e: any) => {
    e.stopPropagation();
    await togglePlayPause();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* Album Art */}
        <Image
          source={{ uri: albumArtUrl }}
          style={styles.albumArt}
          resizeMode="cover"
        />

        {/* Song Info */}
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1} ellipsizeMode="tail">
            {currentSong.name}
          </Text>
          <Text style={styles.artistName} numberOfLines={1} ellipsizeMode="tail">
            {artistName}
          </Text>
        </View>

        {/* Play/Pause Button */}
        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePlayPause}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={20}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 70, // Position above bottom tab bar (70px tab bar height)
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: colors.backgroundSecondary, // #1F222A
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md, // 16px
    paddingVertical: spacing.sm, // 8px
  },
  albumArt: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.small, // 6px
    backgroundColor: colors.backgroundTertiary,
  },
  songInfo: {
    flex: 1,
    marginLeft: spacing.md, // 16px
    marginRight: spacing.sm, // 8px
    justifyContent: 'center',
  },
  songTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  artistName: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Poppins_400Regular',
    color: colors.textSecondary,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round, // Circular
    backgroundColor: colors.primary, // #FF8C28
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
