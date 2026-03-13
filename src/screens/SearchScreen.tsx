/**
 * SearchScreen Component
 * Full-featured search with debouncing, trending suggestions, and categorized results
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import type { Song, Artist, Album } from '../types/api';
import { colors, spacing, borderRadius, typography } from '../theme';
import { SongItem } from '../components/song';
import { ArtistCard } from '../components/home/ArtistCard';
import { AlbumCard } from '../components/home/AlbumCard';
import { searchSongs, searchArtists, searchAlbums } from '../services/api';
import { getImageUrl, formatDuration, getArtistNames } from '../utils/audio';
import { usePlayerStore, useDataStore } from '../store';

type Props = StackScreenProps<RootStackParamList, 'Search'>;

const DEBOUNCE_DELAY = 500;

const TRENDING_SUGGESTIONS = [
  'Arijit Singh',
  'Trending Hindi',
  'English Pop',
  'Bollywood Hits',
  'Romantic Songs',
  'Party Mix',
  'Lofi Beats',
  'Old Classics',
];

export const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { currentSong, play } = usePlayerStore();
  const { getSearchResults, setSearchResults } = useDataStore();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setSongs([]);
      setArtists([]);
      setAlbums([]);
      setHasSearched(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery.trim());
    }, DEBOUNCE_DELAY);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    // Check cache first
    const cachedResults = getSearchResults(query);
    if (cachedResults) {
      setSongs(cachedResults.songs);
      setArtists(cachedResults.artists);
      setAlbums(cachedResults.albums);
      setHasSearched(true);
      return;
    }

    // No cache, fetch from API
    setLoading(true);
    setHasSearched(true);

    try {
      const [songsResponse, artistsResponse, albumsResponse] = await Promise.all([
        searchSongs(query, 1, 10),
        searchArtists(query, 1, 10),
        searchAlbums(query, 1, 10),
      ]);

      const songsData = songsResponse.data.results;
      const artistsData = artistsResponse.data.results;
      const albumsData = albumsResponse.data.results;

      setSongs(songsData);
      setArtists(artistsData);
      setAlbums(albumsData);

      // Cache the results
      setSearchResults(query, songsData, artistsData, albumsData);
    } catch (error) {
      console.error('Search error:', error);
      setSongs([]);
      setArtists([]);
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSongPress = (song: Song) => {
    play(song);
    navigation.navigate('Player', { song });
  };

  const handleArtistPress = (artist: Artist) => {
    navigation.navigate('Artist', { artistId: artist.id });
  };

  const handleAlbumPress = (album: Album) => {
    navigation.navigate('Album', { albumId: album.id });
  };

  const handleClear = () => {
    setSearchQuery('');
    setSongs([]);
    setArtists([]);
    setAlbums([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const handleTrendingPress = (term: string) => {
    setSearchQuery(term);
  };

  const hasResults = songs.length > 0 || artists.length > 0 || albums.length > 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundPrimary} />

      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search songs, artists, albums..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClear} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        )}

        {/* Trending suggestions (shown when no query) */}
        {!loading && !hasSearched && (
          <View style={styles.trendingSection}>
            <View style={styles.trendingHeader}>
              <Ionicons name="trending-up" size={20} color={colors.primary} />
              <Text style={styles.trendingSectionTitle}>Trending Searches</Text>
            </View>
            <View style={styles.trendingGrid}>
              {TRENDING_SUGGESTIONS.map((term) => (
                <TouchableOpacity
                  key={term}
                  style={styles.trendingChip}
                  onPress={() => handleTrendingPress(term)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="search-outline"
                    size={14}
                    color={colors.textMuted}
                  />
                  <Text style={styles.trendingChipText}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* No results */}
        {!loading && hasSearched && !hasResults && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="search-outline" size={40} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtitle}>
              Try different keywords or check the spelling
            </Text>
          </View>
        )}

        {/* Results */}
        {!loading && hasResults && (
          <>
            {/* Songs */}
            {songs.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Songs</Text>
                  <Text style={styles.resultCount}>
                    {songs.length} result{songs.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                {songs.map((song) => (
                  <SongItem
                    key={song.id}
                    title={song.name}
                    artist={getArtistNames(song)}
                    duration={formatDuration(song.duration)}
                    albumArtUri={getImageUrl(song.image)}
                    onPress={() => handleSongPress(song)}
                    isPlaying={currentSong?.id === song.id}
                    style={styles.songItem}
                  />
                ))}
              </View>
            )}

            {/* Artists */}
            {artists.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Artists</Text>
                  <Text style={styles.resultCount}>
                    {artists.length} result{artists.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                >
                  {artists.map((artist) => (
                    <ArtistCard
                      key={artist.id}
                      name={artist.name}
                      imageUri={getImageUrl(artist.image)}
                      onPress={() => handleArtistPress(artist)}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Albums */}
            {albums.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Albums</Text>
                  <Text style={styles.resultCount}>
                    {albums.length} result{albums.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                >
                  {albums.map((album) => (
                    <AlbumCard
                      key={album.id}
                      name={album.name}
                      artist={album.primaryArtists}
                      imageUri={getImageUrl(album.image)}
                      onPress={() => handleAlbumPress(album)}
                    />
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.backgroundTertiary,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    paddingVertical: 0,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },

  /* Trending */
  trendingSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  trendingSectionTitle: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  trendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.backgroundTertiary,
  },
  trendingChipText: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
  },

  /* Loading */
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.md,
  },

  /* Empty */
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyIconBg: {
    width: 88,
    height: 88,
    borderRadius: borderRadius.round,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.backgroundTertiary,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  /* Sections */
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  resultCount: {
    ...typography.caption,
    color: colors.textMuted,
  },
  songItem: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  horizontalList: {
    paddingHorizontal: spacing.md,
  },
});
