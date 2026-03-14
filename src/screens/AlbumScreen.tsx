/**
 * AlbumScreen Component
 * Figma-matched album detail with:
 *  - Back arrow, search, 3-dot menu
 *  - Large album artwork with rounded corners
 *  - Album name
 *  - Stats: X Album | Y Songs | duration
 *  - Shuffle + Play buttons (orange)
 *  - Songs list with "See All"
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import type { Song } from '../types/api';
import { colors, spacing, borderRadius, typography } from '../theme';
import { SongItem } from '../components/song';
import { searchSongs, getAlbumById } from '../services/api';
import { getImageUrl, formatDuration, getArtistNames } from '../utils/audio';
import { usePlayerStore, useQueueStore } from '../store';

type Props = StackScreenProps<RootStackParamList, 'Album'>;

export const AlbumScreen: React.FC<Props> = ({ route, navigation }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [albumName, setAlbumName] = useState('Album');
  const [albumImage, setAlbumImage] = useState<string | undefined>();
  const [albumArtist, setAlbumArtist] = useState('Unknown Artist');

  const { currentSong, play } = usePlayerStore();
  const { playAndBuildQueue } = useQueueStore();

  useEffect(() => {
    loadAlbumData();
  }, [route.params.albumId]);

  const loadAlbumData = async () => {
    try {
      setLoading(true);
      // Fetch album details using the albumId from route params
      const albumData = await getAlbumById(route.params.albumId);
      const album = albumData.data;
      
      setSongs(album.songs || []);
      setAlbumName(album.name || 'Album');
      setAlbumImage(getImageUrl(album.image, '500x500'));
      setAlbumArtist(album.primaryArtists || 'Unknown Artist');
    } catch (error) {
      console.error('Error loading album:', error);
      // Fallback to search if album API fails
      try {
        const response = await searchSongs(route.params.albumId, 1, 20);
        const results = response.data.results;
        setSongs(results);
        if (results.length > 0) {
          setAlbumName(results[0].album?.name || 'Album');
          setAlbumImage(getImageUrl(results[0].image, '500x500'));
          setAlbumArtist(getArtistNames(results[0]));
        }
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSongPress = (song: Song) => {
    playAndBuildQueue(song, songs);
    play(song);
    navigation.navigate('Player', { song });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.backgroundPrimary} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundPrimary} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
            <Ionicons name="search-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
            <Ionicons name="ellipsis-horizontal" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Album Image */}
        <View style={styles.imageSection}>
          {albumImage ? (
            <Image source={{ uri: albumImage }} style={styles.albumImage} />
          ) : (
            <View style={[styles.albumImage, styles.albumImagePlaceholder]}>
              <Ionicons name="disc" size={60} color={colors.textMuted} />
            </View>
          )}
        </View>

        {/* Album Name */}
        <Text style={styles.albumName}>{albumName}</Text>

        {/* Stats */}
        <Text style={styles.albumStats}>
          1 Album  |  {songs.length} Songs  |  01:20:38 mins
        </Text>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.shuffleButton} activeOpacity={0.7}>
            <Ionicons name="shuffle" size={20} color={colors.backgroundPrimary} />
            <Text style={styles.shuffleButtonText}>Shuffle</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.playActionButton} activeOpacity={0.7}>
            <Ionicons name="play" size={18} color={colors.backgroundPrimary} />
            <Text style={styles.playActionButtonText}>Play</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Songs Section */}
        <View style={styles.songsHeader}>
          <Text style={styles.songsSectionTitle}>Songs</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Songs List */}
        {songs.map((song, index) => (
          <View key={`album-song-${song.id}-${index}`} style={styles.songItemContainer}>
            <SongItem
              song={song}
              title={song.name}
              artist={getArtistNames(song)}
              albumArtUri={getImageUrl(song.image)}
              onPress={() => handleSongPress(song)}
              onMorePress={() => console.log('More', song.name)}
              isPlaying={currentSong?.id === song.id}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 44,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Album Image ──
  imageSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  albumImage: {
    width: 220,
    height: 220,
    borderRadius: borderRadius.xlarge,
    backgroundColor: colors.backgroundSecondary,
  },
  albumImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
  },

  // ── Album Info ──
  albumName: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  albumStats: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  // ── Action Buttons ──
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    gap: spacing.sm,
    flex: 1,
  },
  shuffleButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.backgroundPrimary,
  },
  playActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    gap: spacing.sm,
    flex: 1,
  },
  playActionButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.backgroundPrimary,
  },

  // ── Divider ──
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },

  // ── Songs Section ──
  songsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  songsSectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: colors.textPrimary,
  },
  seeAllText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: colors.primary,
  },
  songItemContainer: {
    paddingHorizontal: spacing.md,
  },
});
