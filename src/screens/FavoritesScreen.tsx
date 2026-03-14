/**
 * Favorites Screen
 * Displays user's favorite songs
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme';
import { useFavoritesStore, usePlayerStore, useQueueStore } from '../store';
import { SongItem, SongOptionsModal } from '../components/song';
import { getArtistNames, getImageUrl, formatDuration } from '../utils/audio';
import { Song } from '../types/api';

export const FavoritesScreen: React.FC = () => {
  const { favorites } = useFavoritesStore();
  const { currentSong, play } = usePlayerStore();
  const { addToQueue, setQueue } = useQueueStore();
  
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showSongOptions, setShowSongOptions] = useState(false);

  const handleSongPress = (song: Song, index: number) => {
    // If selecting a song from favorites, set the whole favorites list as the queue
    setQueue(favorites, index);
    play(song);
  };

  const handleSongMorePress = (song: Song) => {
    setSelectedSong(song);
    setShowSongOptions(true);
  };

  const handleAddToQueue = () => {
    if (selectedSong) {
      addToQueue(selectedSong, true); // Add as manual
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBg}>
        <Ionicons name="heart-dislike-outline" size={64} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptySubtitle}>
        Songs you like will appear here. Start exploring and hit the heart icon!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundPrimary} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
      </View>

      {/* List */}
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <SongItem
            song={item}
            title={item.name}
            artist={getArtistNames(item)}
            duration={formatDuration(item.duration)}
            albumArtUri={getImageUrl(item.image)}
            onPress={() => handleSongPress(item, index)}
            onMorePress={() => handleSongMorePress(item)}
            isPlaying={currentSong?.id === item.id}
            style={styles.songItem}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          favorites.length === 0 && styles.listEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Options Modal */}
      <SongOptionsModal
        visible={showSongOptions}
        song={selectedSong}
        onClose={() => setShowSongOptions(false)}
        onAddToQueue={handleAddToQueue}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 44,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100, // Space for mini player and bottom tabs
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  songItem: {
    marginBottom: 4,
  },
  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIconBg: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(255, 140, 40, 0.1)', // Light primary color
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
