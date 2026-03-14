/**
 * Playlists Screen (Queue Management)
 * Displays and manages the playback queue with drag-and-drop reordering
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { useQueueStore } from '../store/queueStore';
import { usePlayerStore } from '../store/playerStore';
import { QueueItem } from '../components/queue';
import { Song } from '../types';

export const PlaylistsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { queue, currentIndex, removeFromQueue, reorderQueue, clearQueue, setCurrentIndex } =
    useQueueStore();
  const { currentSong, play } = usePlayerStore();

  const handleDelete = useCallback(
    (index: number) => {
      removeFromQueue(index);
    },
    [removeFromQueue]
  );

  const handleSongPress = useCallback(
    async (index: number) => {
      setCurrentIndex(index);
      await play(queue[index]);
      // Navigate to player screen
      navigation.navigate('Player' as never);
    },
    [queue, setCurrentIndex, play, navigation]
  );

  const handleDragEnd = useCallback(
    ({ data, from, to }: { data: Song[]; from: number; to: number }) => {
      if (from !== to) {
        reorderQueue(from, to);
      }
    },
    [reorderQueue]
  );

  const handleClearQueue = useCallback(() => {
    clearQueue();
  }, [clearQueue]);

  const renderItem = useCallback(
    ({ item, drag, isActive, getIndex }: RenderItemParams<Song>) => {
      const isCurrentlyPlaying = currentSong?.id === item.id;
      const index = getIndex();

      return (
        <ScaleDecorator>
          <QueueItem
            song={item}
            index={index ?? 0}
            isCurrentlyPlaying={isCurrentlyPlaying}
            onDelete={() => handleDelete(index ?? 0)}
            onPress={() => handleSongPress(index ?? 0)}
            drag={drag}
            isActive={isActive}
          />
        </ScaleDecorator>
      );
    },
    [currentSong, handleDelete, handleSongPress]
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Queue is Empty</Text>
      <Text style={styles.emptySubtext}>
        Add songs from the Home screen to start building your queue
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>Queue</Text>
        <Text style={styles.subtitle}>
          {queue.length} {queue.length === 1 ? 'song' : 'songs'}
        </Text>
      </View>
      {queue.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClearQueue}>
          <Text style={styles.clearButtonText}>Clear Queue</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.gestureContainer}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.backgroundPrimary} />
        {renderHeader()}
        {queue.length === 0 ? (
          renderEmptyState()
        ) : (
          <DraggableFlatList
            data={queue}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            onDragEnd={handleDragEnd}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  gestureContainer: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textTertiary,
  },
  clearButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
  },
  clearButtonText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 100, // Space for tab bar + mini player
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  emptyTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
