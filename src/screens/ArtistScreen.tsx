/**
 * ArtistScreen Component
 * Figma-matched artist detail with:
 *  - Back arrow, search, 3-dot menu
 *  - Large rounded artist image
 *  - Artist name
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
import { searchSongs } from '../services/api';
import { getImageUrl, formatDuration, getArtistNames } from '../utils/audio';
import { usePlayerStore, useQueueStore } from '../store';

type Props = StackScreenProps<RootStackParamList, 'Artist'>;

export const ArtistScreen: React.FC<Props> = ({ route, navigation }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [artistName, setArtistName] = useState('Artist');
  const [artistImage, setArtistImage] = useState<string | undefined>();

  const { currentSong, play } = usePlayerStore();
  const { playAndBuildQueue } = useQueueStore();

  useEffect(() => {
    loadArtistData();
  }, []);

  const loadArtistData = async () => {
    try {
      const response = await searchSongs('popular', 1, 8);
      const results = response.data.results;
      setSongs(results);
      if (results.length > 0) {
        setArtistName(getArtistNames(results[0]));
        setArtistImage(getImageUrl(results[0].image, '500x500'));
      }
    } catch (error) {
      console.error('Error loading artist:', error);
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

        {/* Artist Image */}
        <View style={styles.imageSection}>
          {artistImage ? (
            <Image source={{ uri: artistImage }} style={styles.artistImage} />
          ) : (
            <View style={[styles.artistImage, styles.artistImagePlaceholder]}>
              <Ionicons name="person" size={60} color={colors.textMuted} />
            </View>
          )}
        </View>

        {/* Artist Name */}
        <Text style={styles.artistName}>{artistName}</Text>

        {/* Stats */}
        <Text style={styles.artistStats}>
          1 Album  |  {songs.length} Songs  |  01:25:43 mins
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
        {songs.map((song) => (
          <View key={song.id} style={styles.songItemContainer}>
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

  // ── Artist Image ──
  imageSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  artistImage: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.xlarge,
    backgroundColor: colors.backgroundSecondary,
  },
  artistImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
  },

  // ── Artist Info ──
  artistName: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  artistStats: {
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
