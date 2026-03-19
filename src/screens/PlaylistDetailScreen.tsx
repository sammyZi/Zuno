/**
 * Playlist Detail Screen
 * Shows all songs in a playlist with play functionality
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../theme';
import { usePlaylistStore } from '../store/playlistStore';
import { usePlayerStore } from '../store/playerStore';
import { useQueueStore } from '../store/queueStore';
import { getImageUrl, getArtistNames, formatDuration } from '../utils/audio';
import { SongItem } from '../components/song/SongItem';
import { SongOptionsModal } from '../components/song/SongOptionsModal';
import { PlaylistOptionsModal } from '../components/playlist/PlaylistOptionsModal';
import type { Song } from '../types/api';

interface PlaylistDetailScreenProps {
  route: {
    params: {
      playlistId: string;
    };
  };
  navigation: any;
}

export const PlaylistDetailScreen: React.FC<PlaylistDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { playlistId } = route.params;
  const { getPlaylist, removeSongFromPlaylist, deletePlaylist, renamePlaylist } = usePlaylistStore();
  const { play, pause, currentSong, isPlaying } = usePlayerStore();
  const { setQueue, addToQueue } = useQueueStore();
  
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);

  const playlist = getPlaylist(playlistId);

  if (!playlist) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.emptyText}>Playlist not found</Text>
          <Pressable
            style={styles.backToListButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backToListText}>Back to Playlists</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handlePlayAll = () => {
    if (playlist.songs.length > 0) {
      setQueue(playlist.songs, 0);
      play(playlist.songs[0]);
    }
  };

  const handlePlaySong = (song: Song, index: number) => {
    if (currentSong?.id === song.id && isPlaying) {
      // If same song is playing, pause it
      pause();
    } else {
      // Play only the selected song, don't auto-populate queue
      // User must manually add songs or use "Play All"
      play(song);
    }
  };

  const handleMorePress = (song: Song) => {
    setSelectedSong(song);
    setShowOptionsModal(true);
  };

  const handleAddToQueue = () => {
    if (selectedSong) {
      addToQueue(selectedSong, true); // Add as manual
    }
  };

  const handleDeletePlaylist = () => {
    deletePlaylist(playlistId);
    navigation.goBack();
  };

  const handleRenamePlaylist = (newName: string) => {
    renamePlaylist(playlistId, newName);
  };

  const handleSharePlaylist = () => {
    // TODO: Implement share functionality
    alert('Share playlist feature coming soon!');
  };

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => {
    const imageUrl = getImageUrl(item.image, '150x150');
    const artistNames = getArtistNames(item);
    const duration = formatDuration(item.duration);
    const isCurrentlyPlaying = currentSong?.id === item.id && isPlaying;

    return (
      <SongItem
        song={item}
        title={item.name}
        artist={artistNames}
        duration={duration}
        albumArtUri={imageUrl}
        onPress={() => handlePlaySong(item, index)}
        onMorePress={() => handleMorePress(item)}
        isPlaying={isCurrentlyPlaying}
      />
    );
  };

  const totalDuration = playlist.songs.reduce((acc, song) => acc + song.duration, 0);
  const totalMinutes = Math.floor(totalDuration / 60);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          
        >
          <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {playlist.name}
          </Text>
        </View>
        <Pressable
          style={styles.headerButton}
          onPress={() => setShowPlaylistMenu(true)}
          
        >
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      {/* Playlist Info Card */}
      <View style={styles.playlistInfoCard}>
        <View style={styles.playlistIconLarge}>
          <Ionicons name="musical-notes" size={56} color={colors.primary} />
        </View>
        <View style={styles.playlistMeta}>
          <Text style={styles.playlistName} numberOfLines={2}>
            {playlist.name}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="musical-note" size={14} color={colors.textMuted} />
            <Text style={styles.metaText}>
              {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
            </Text>
            {totalMinutes > 0 && (
              <>
                <Text style={styles.metaDot}>•</Text>
                <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                <Text style={styles.metaText}>{totalMinutes} min</Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      {playlist.songs.length > 0 && (
        <View style={styles.actionButtons}>
          <Pressable
            style={styles.playAllButton}
            onPress={handlePlayAll}
            
          >
            <Ionicons name="play" size={18} color={colors.backgroundPrimary} />
            <Text style={styles.playAllText}>Play All</Text>
          </Pressable>
          <Pressable
            style={styles.shuffleButton}
            onPress={() => {
              // TODO: Shuffle and play
              handlePlayAll();
            }}
            
          >
            <Ionicons name="shuffle" size={18} color={colors.primary} />
            <Text style={styles.shuffleText}>Shuffle</Text>
          </Pressable>
        </View>
      )}

      {/* Songs List */}
      {playlist.songs.length > 0 ? (
        <FlatList
          data={playlist.songs}
          renderItem={renderSongItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>
              {playlist.songs.length} {playlist.songs.length === 1 ? 'Song' : 'Songs'}
            </Text>
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Ionicons name="musical-notes-outline" size={48} color={colors.primary} />
          </View>
          <Text style={styles.emptyText}>No songs yet</Text>
          <Text style={styles.emptySubtext}>
            Add songs from the player or home screen
          </Text>
        </View>
      )}

      {/* Song Options Modal */}
      <SongOptionsModal
        visible={showOptionsModal}
        song={selectedSong}
        onClose={() => setShowOptionsModal(false)}
        onAddToQueue={handleAddToQueue}
      />

      {/* Playlist Options Modal */}
      <PlaylistOptionsModal
        visible={showPlaylistMenu}
        playlistName={playlist.name}
        onClose={() => setShowPlaylistMenu(false)}
        onRename={handleRenamePlaylist}
        onDelete={handleDeletePlaylist}
        onShare={handleSharePlaylist}
      />
    </View>
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
    paddingBottom: spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  playlistInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.large,
  },
  playlistIconLarge: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.medium,
    backgroundColor: 'rgba(255, 140, 40, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  playlistMeta: {
    flex: 1,
  },
  playlistName: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
  },
  metaDot: {
    fontSize: 13,
    color: colors.textMuted,
    marginHorizontal: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  playAllButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.medium,
    gap: spacing.xs,
  },
  playAllText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.backgroundPrimary,
  },
  shuffleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 140, 40, 0.1)',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.medium,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 140, 40, 0.3)',
    gap: spacing.xs,
  },
  shuffleText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 120,
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
  backToListButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
  },
  backToListText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.backgroundPrimary,
  },
});

