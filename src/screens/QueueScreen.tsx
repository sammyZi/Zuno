/**
 * Queue Screen
 * Shows current playback queue with drag-to-reorder functionality
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, borderRadius } from '../theme';
import { useQueueStore } from '../store/queueStore';
import { usePlayerStore } from '../store/playerStore';
import { getImageUrl, getArtistNames } from '../utils/audio';
import { getSongSuggestions } from '../services/api/songs';
import type { Song } from '../types/api';

type Props = StackScreenProps<RootStackParamList, 'Queue'>;

interface QueueItem {
  song: Song;
  index: number;
}

export const QueueScreen: React.FC<Props> = ({ navigation }) => {
  const { queue, currentIndex, removeFromQueue, reorderQueue, clearQueue } = useQueueStore();
  const { currentSong, play } = usePlayerStore();
  const [isReordering, setIsReordering] = useState(false);
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Convert queue to items with indices
  const queueItems: QueueItem[] = queue.map((song, index) => ({ song, index }));

  // Fetch recommended songs based on current song from API
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (currentSong) {
        setLoadingRecommendations(true);
        try {
          const suggestions = await getSongSuggestions(currentSong.id, 10);
          // Filter out songs already in queue
          const queueIds = new Set(queue.map(s => s.id));
          const filtered = suggestions.filter(song => !queueIds.has(song.id)).slice(0, 5);
          setRecommendedSongs(filtered);
        } catch (error) {
          console.error('Failed to fetch recommendations:', error);
          setRecommendedSongs([]);
        } finally {
          setLoadingRecommendations(false);
        }
      }
    };

    fetchRecommendations();
  }, [currentSong?.id]); // Only re-fetch when current song changes

  const handlePlaySong = (song: Song, index: number) => {
    useQueueStore.getState().setCurrentIndex(index);
    play(song);
  };

  const handleRemoveSong = (index: number) => {
    if (index === currentIndex) {
      Alert.alert(
        'Cannot Remove',
        'Cannot remove the currently playing song',
        [{ text: 'OK' }]
      );
      return;
    }
    removeFromQueue(index);
  };

  const handleClearQueue = () => {
    Alert.alert(
      'Clear Queue',
      'Are you sure you want to clear the entire queue? This will stop playback.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearQueue();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleAddRecommended = (song: Song) => {
    useQueueStore.getState().addToQueue(song, true); // Add as manual
    // Remove from recommendations list
    setRecommendedSongs(prev => prev.filter(s => s.id !== song.id));
  };

  const handleDragEnd = ({ data, from, to }: { data: QueueItem[]; from: number; to: number }) => {
    if (from !== to) {
      reorderQueue(from, to);
    }
  };

  const renderQueueItem = ({ item, drag, isActive }: RenderItemParams<QueueItem>) => {
    const { song, index } = item;
    const imageUrl = getImageUrl(song.image, '150x150');
    const artistNames = getArtistNames(song);
    const isCurrentSong = currentSong?.id === song.id;
    const isUpcoming = index > currentIndex;
    const isPlayed = index < currentIndex;

    return (
      <ScaleDecorator>
        <Animated.View
          entering={FadeInDown.delay(index * 30).springify()}
          style={[
            styles.queueItem,
            isCurrentSong && styles.queueItemActive,
            isPlayed && styles.queueItemPlayed,
            isActive && styles.queueItemDragging,
          ]}
        >
          <TouchableOpacity
            style={styles.queueItemContent}
            onPress={() => handlePlaySong(song, index)}
            onLongPress={drag}
            disabled={isActive}
            activeOpacity={0.7}
          >
            {/* Drag Handle */}
            <View style={styles.dragHandle}>
              <Ionicons name="reorder-two" size={20} color={colors.textMuted} />
            </View>

            {/* Album Art */}
            <View style={styles.albumArtContainer}>
              <Image source={{ uri: imageUrl }} style={styles.albumArt} />
              {isCurrentSong && (
                <View style={styles.playingIndicator}>
                  <View style={styles.playingBar} />
                  <View style={[styles.playingBar, styles.playingBar2]} />
                  <View style={[styles.playingBar, styles.playingBar3]} />
                </View>
              )}
            </View>

            {/* Song Info */}
            <View style={styles.songInfo}>
              <Text
                style={[
                  styles.songTitle,
                  isCurrentSong && styles.songTitleActive,
                  isPlayed && styles.songTitlePlayed,
                ]}
                numberOfLines={1}
              >
                {song.name}
              </Text>
              <Text
                style={[styles.artistName, isPlayed && styles.artistNamePlayed]}
                numberOfLines={1}
              >
                {artistNames}
              </Text>
            </View>

            {/* Status Badge */}
            {isCurrentSong && (
              <View style={styles.nowPlayingBadge}>
                <Text style={styles.nowPlayingText}>Now</Text>
              </View>
            )}
            {isUpcoming && !isCurrentSong && (
              <Text style={styles.queuePosition}>{index - currentIndex}</Text>
            )}

            {/* Remove Button */}
            {!isCurrentSong && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveSong(index)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScaleDecorator>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Queue</Text>
          <Text style={styles.headerSubtitle}>
            {queue.length} {queue.length === 1 ? 'song' : 'songs'} • Long press to reorder
          </Text>
        </View>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearQueue}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={22} color={colors.error} />
        </TouchableOpacity>
      </Animated.View>

      {/* Queue List */}
      {queue.length > 0 ? (
        <>
          <DraggableFlatList
            data={queueItems}
            renderItem={renderQueueItem}
            keyExtractor={(item) => `${item.song.id}-${item.index}`}
            onDragEnd={handleDragEnd}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            activationDistance={10}
            ListFooterComponent={
              recommendedSongs.length > 0 || loadingRecommendations ? (
                <Animated.View entering={FadeInUp.delay(200)} style={styles.recommendedSection}>
                  <View style={styles.recommendedHeader}>
                    <Ionicons name="sparkles" size={18} color={colors.primary} />
                    <Text style={styles.recommendedTitle}>Recommended</Text>
                  </View>
                  {loadingRecommendations ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <Text style={styles.loadingText}>Finding similar songs...</Text>
                    </View>
                  ) : (
                    recommendedSongs.map((song, index) => {
                      const imageUrl = getImageUrl(song.image, '150x150');
                      const artistNames = getArtistNames(song);
                      return (
                        <Animated.View
                          key={song.id}
                          entering={FadeInUp.delay(300 + index * 50).springify()}
                          style={styles.recommendedItem}
                        >
                          <TouchableOpacity
                            style={styles.recommendedItemContent}
                            onPress={() => handlePlaySong(song, queue.length)}
                            activeOpacity={0.7}
                          >
                            <Image source={{ uri: imageUrl }} style={styles.recommendedAlbumArt} />
                            <View style={styles.recommendedSongInfo}>
                              <Text style={styles.recommendedSongTitle} numberOfLines={1}>
                                {song.name}
                              </Text>
                              <Text style={styles.recommendedArtistName} numberOfLines={1}>
                                {artistNames}
                              </Text>
                            </View>
                            <TouchableOpacity
                              style={styles.addButton}
                              onPress={() => handleAddRecommended(song)}
                              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                              <Ionicons name="add-circle" size={28} color={colors.primary} />
                            </TouchableOpacity>
                          </TouchableOpacity>
                        </Animated.View>
                      );
                    })
                  )}
                </Animated.View>
              ) : null
            }
          />
        </>
      ) : (
        <Animated.View entering={FadeInUp.duration(400)} style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Ionicons name="list-outline" size={48} color={colors.primary} />
          </View>
          <Text style={styles.emptyText}>Queue is empty</Text>
          <Text style={styles.emptySubtext}>
            Play a song to start building your queue
          </Text>
        </Animated.View>
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingTop: (StatusBar.currentHeight ?? 24) + 8,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
    marginTop: 2,
  },
  clearButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  queueItem: {
    marginBottom: spacing.xs,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.backgroundSecondary,
    overflow: 'hidden',
  },
  queueItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  queueItemActive: {
    backgroundColor: 'rgba(255, 140, 40, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 40, 0.3)',
  },
  queueItemPlayed: {
    opacity: 0.5,
  },
  queueItemDragging: {
    opacity: 0.9,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dragHandle: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  albumArtContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  albumArt: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.small,
  },
  playingIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    backgroundColor: colors.primary,
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: 4,
  },
  playingBar: {
    width: 2,
    height: 8,
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 1,
  },
  playingBar2: {
    height: 12,
  },
  playingBar3: {
    height: 6,
  },
  songInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  songTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  songTitleActive: {
    color: colors.primary,
  },
  songTitlePlayed: {
    color: colors.textMuted,
  },
  artistName: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
  },
  artistNamePlayed: {
    opacity: 0.7,
  },
  nowPlayingBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.small,
    marginRight: spacing.sm,
  },
  nowPlayingText: {
    fontSize: 10,
    fontFamily: 'Poppins_700Bold',
    color: colors.backgroundPrimary,
    textTransform: 'uppercase',
  },
  queuePosition: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textMuted,
    marginRight: spacing.sm,
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    padding: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(255, 140, 40, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Recommended Section
  recommendedSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  recommendedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  recommendedTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
  },
  recommendedItem: {
    marginBottom: spacing.xs,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.backgroundSecondary,
    overflow: 'hidden',
  },
  recommendedItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  recommendedAlbumArt: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.small,
    marginRight: spacing.md,
  },
  recommendedSongInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  recommendedSongTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  recommendedArtistName: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
  },
  addButton: {
    padding: spacing.xs,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
  },
});
