/**
 * Queue Screen
 * Shows current playback queue with drag-to-reorder functionality
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, borderRadius } from '../theme';
import { useQueueStore } from '../store/queueStore';
import { usePlayerStore } from '../store/playerStore';
import { getImageUrl, getArtistNames } from '../utils/audio';
import type { Song } from '../types/api';

type Props = StackScreenProps<RootStackParamList, 'Queue'>;

interface QueueItem {
  song: Song;
  index: number;
}

export const QueueScreen: React.FC<Props> = ({ navigation }) => {
  const { queue, currentIndex, removeFromQueue, reorderQueue, clearQueue } = useQueueStore();
  const { currentSong, play } = usePlayerStore();
  const [refreshKey, setRefreshKey] = useState(0);
  const [showClearModal, setShowClearModal] = useState(false);

  // Force refresh when current song or index changes
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [currentSong?.id, currentIndex]);

  // Convert queue to items with indices, filter out any invalid songs
  const queueItems: QueueItem[] = useMemo(() => 
    queue
      .map((song, index) => ({ song, index }))
      .filter(item => item.song && item.song.id),
    [queue]
  );

  const handlePlaySong = (song: Song, index: number) => {
    useQueueStore.getState().setCurrentIndex(index);
    play(song);
  };

  const handleRemoveSong = (index: number) => {
    if (index === currentIndex) {
      // Cannot remove currently playing song
      console.log('[QueueScreen] Cannot remove currently playing song');
      return;
    }
    console.log('[QueueScreen] Removing song at index:', index);
    removeFromQueue(index);
    // Force UI refresh
    setRefreshKey(prev => prev + 1);
  };

  const handleClearQueue = () => {
    setShowClearModal(true);
  };

  const confirmClearQueue = async () => {
    console.log('[QueueScreen] Clearing queue and stopping playback');
    
    // Stop playback first
    const { pause, reset } = usePlayerStore.getState();
    await pause();
    await reset();
    
    // Clear the queue
    clearQueue();
    
    setShowClearModal(false);
    navigation.goBack();
  };

  const handleDragEnd = useCallback(({ from, to }: { data: QueueItem[]; from: number; to: number }) => {
    if (from !== to) {
      reorderQueue(from, to);
    }
  }, [reorderQueue]);

  const renderQueueItem = useCallback(({ item, drag, isActive }: RenderItemParams<QueueItem>) => {
    const { song, index } = item;
    
    // Defensive check - skip if song is undefined
    if (!song || !song.id) {
      return null;
    }
    
    const imageUrl = getImageUrl(song.image, '150x150');
    const artistNames = getArtistNames(song);
    const isCurrentSong = currentSong?.id === song.id;
    const isUpcoming = index > currentIndex;
    const isPlayed = index < currentIndex;

    return (
      <ScaleDecorator>
        <View
          style={[
            styles.queueItem,
            isCurrentSong && styles.queueItemActive,
            isPlayed && styles.queueItemPlayed,
            isActive && styles.queueItemDragging,
          ]}
        >
          <Pressable
            style={styles.queueItemContent}
            onPress={() => handlePlaySong(song, index)}
            onLongPress={drag}
            disabled={isActive}
            
          >
            {/* Drag Handle */}
            <View style={styles.dragHandle}>
              <Ionicons name="reorder-two" size={20} color={colors.textMuted} />
            </View>

            {/* Album Art */}
            <View style={styles.albumArtContainer}>
              {imageUrl ? (
                <Image 
                  source={{ uri: imageUrl }} 
                  style={styles.albumArt}
                />
              ) : (
                <View style={[styles.albumArt, styles.albumArtPlaceholder]}>
                  <Ionicons name="musical-notes" size={24} color={colors.textMuted} />
                </View>
              )}
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
              <Pressable
                style={styles.removeButton}
                onPress={() => handleRemoveSong(index)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={22} color={colors.textMuted} />
              </Pressable>
            )}
          </Pressable>
        </View>
      </ScaleDecorator>
    );
  }, [currentSong?.id, currentIndex, handlePlaySong, handleRemoveSong]);

  return (
    <>
      <GestureHandlerRootView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.backgroundPrimary} translucent={false} />

        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            
          >
            <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Queue</Text>
            <Text style={styles.headerSubtitle}>
              {queue.length} {queue.length === 1 ? 'song' : 'songs'} • Long press to reorder
            </Text>
          </View>
          <Pressable
            style={styles.clearButton}
            onPress={handleClearQueue}
            
          >
            <Ionicons name="trash-outline" size={22} color={colors.error} />
          </Pressable>
        </View>

        {/* Queue List */}
        {queue.length > 0 ? (
          <DraggableFlatList
            key={refreshKey}
            data={queueItems}
            renderItem={renderQueueItem}
            keyExtractor={(item) => `${item.song.id}-${item.index}`}
            onDragEnd={handleDragEnd}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            activationDistance={10}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="list-outline" size={48} color={colors.primary} />
            </View>
            <Text style={styles.emptyText}>Queue is empty</Text>
            <Text style={styles.emptySubtext}>
              Play a song to start building your queue
            </Text>
          </View>
        )}
      </GestureHandlerRootView>

      {/* Clear Queue Modal */}
      <Modal
        visible={showClearModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowClearModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Clear Queue</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to clear the entire queue? This will stop playback.
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowClearModal(false)}
                
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmClearQueue}
                
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Clear</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.backgroundPrimary,
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
    paddingTop:12,
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
    backgroundColor: colors.backgroundTertiary,
  },
  albumArtPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.backgroundTertiary,
  },
  modalButtonConfirm: {
    backgroundColor: colors.error,
  },
  modalButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
  },
  modalButtonTextConfirm: {
    color: colors.textPrimary,
  },
});

