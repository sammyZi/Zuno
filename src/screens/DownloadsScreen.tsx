/**
 * Downloads Screen
 * Shows all downloaded songs for offline playback
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList, TabParamList } from '../navigation/types';
import { colors, spacing, borderRadius, typography } from '../theme';
import { SongItem } from '../components/song';
import { LoadingSpinner } from '../components/common';
import { DownloadService } from '../services/storage';
import { usePlayerStore, useQueueStore, useDownloadStore } from '../store';
import { getImageUrl, formatDuration, getArtistNames } from '../utils/audio';
import type { Song } from '../types/api';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Downloads'>,
  StackScreenProps<RootStackParamList>
>;

export const DownloadsScreen: React.FC<Props> = ({ navigation }) => {
  const [downloadedSongs, setDownloadedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('Recent');

  const { currentSong, play } = usePlayerStore();
  const { playAndBuildQueue } = useQueueStore();
  const { downloadedSongs: downloadedSet, deleteDownload } = useDownloadStore();

  useEffect(() => {
    loadDownloadedSongs();
  }, [downloadedSet]);

  const loadDownloadedSongs = async () => {
    try {
      setLoading(true);
      await DownloadService.initialize();
      const downloads = DownloadService.getAllDownloads();
      
      // Sort by download date (most recent first)
      const sorted = downloads.sort((a, b) => b.downloadedAt - a.downloadedAt);
      const songs = sorted.map(d => d.song);
      
      setDownloadedSongs(songs);
    } catch (error) {
      console.error('Error loading downloads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSongPress = (song: Song) => {
    playAndBuildQueue(song, downloadedSongs);
    play(song);
    navigation.navigate('Player', { song });
  };

  const handleDeleteDownload = (song: Song) => {
    Alert.alert(
      'Delete Download',
      `Remove "${song.name}" from downloads?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteDownload(song.id);
            await loadDownloadedSongs();
          },
        },
      ]
    );
  };

  const handleSort = () => {
    const newSort = sortOption === 'Recent' ? 'A-Z' : 'Recent';
    setSortOption(newSort);
    
    const sorted = [...downloadedSongs].sort((a, b) => {
      if (newSort === 'A-Z') {
        return a.name.localeCompare(b.name);
      } else {
        const aDownload = DownloadService.getDownloadInfo(a.id);
        const bDownload = DownloadService.getDownloadInfo(b.id);
        return (bDownload?.downloadedAt || 0) - (aDownload?.downloadedAt || 0);
      }
    });
    setDownloadedSongs(sorted);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="download-outline" size={64} color={colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>No Downloaded Songs</Text>
      <Text style={styles.emptySubtitle}>
        Download songs from the home screen to listen offline
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.7}
      >
        <Text style={styles.emptyButtonText}>Browse Music</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.listHeaderCount}>
        {downloadedSongs.length} {downloadedSongs.length === 1 ? 'song' : 'songs'}
      </Text>
      <TouchableOpacity
        style={styles.sortButton}
        onPress={handleSort}
        activeOpacity={0.7}
      >
        <Text style={styles.sortButtonText}>{sortOption}</Text>
        <Ionicons name="swap-vertical" size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.backgroundPrimary} />
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>Loading downloads...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundPrimary} />

      {/* Header - Matching Home/Favorites style */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Downloads</Text>
      </View>

      {/* Content */}
      {downloadedSongs.length === 0 ? (
        <View style={styles.emptyWrapper}>
          {renderEmptyState()}
        </View>
      ) : (
        <FlatList
          data={downloadedSongs}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <View style={styles.songItemWrapper}>
              <SongItem
                song={item}
                title={item.name}
                artist={getArtistNames(item)}
                duration={formatDuration(item.duration)}
                albumArtUri={getImageUrl(item.image)}
                onPress={() => handleSongPress(item)}
                isPlaying={currentSong?.id === item.id}
                style={styles.songItem}
              />
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteDownload(item)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  appNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  appName: {
    color: colors.textPrimary,
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.5,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  listHeaderCount: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: colors.textPrimary,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sortButtonText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 120,
  },
  songItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  songItem: {
    flex: 1,
  },
  deleteButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -80,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  emptyButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.large,
  },
  emptyButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.backgroundPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
