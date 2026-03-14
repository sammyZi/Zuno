/**
 * SearchScreen Component
 * Figma-matched search with:
 *  - Search bar with orange border when focused
 *  - Recent Searches list with "Clear All" button
 *  - Category filter chips (Songs, Artists, Albums, Folders)
 *  - Song results as vertical list with play button + 3-dot
 *  - Not Found state with sad emoji illustration
 * 
 * References:
 *  - 20_Dark_search type keyword.png
 *  - 21_Dark_search result not found.png
 *  - 22_Dark_search results list.png
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import type { Song, Artist, Album } from '../types/api';
import { colors, spacing } from '../theme';
import {
  SearchBar,
  SearchFilterChips,
  SearchEmptyState,
  SearchLoadingState,
  RecentSearches,
  SearchResultsList,
  type SearchFilter,
} from '../components/search';
import { SongOptionsModal } from '../components/song';
import { searchSongs, searchArtists, searchAlbums } from '../services/api';
import { usePlayerStore, useDataStore, useQueueStore } from '../store';

type Props = StackScreenProps<RootStackParamList, 'Search'>;

const DEBOUNCE_DELAY = 500;

const SEARCH_FILTERS: SearchFilter[] = ['Songs', 'Artists', 'Albums', 'Folders'];

export const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFilter, setActiveFilter] = useState<SearchFilter>('Songs');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showSongOptions, setShowSongOptions] = useState(false);

  const { currentSong, play } = usePlayerStore();
  const { addToQueue } = useQueueStore();
  const { getSearchResults, setSearchResults, recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } = useDataStore();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search effect
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
      // Add to recent searches
      addRecentSearch(query);
      return;
    }

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

      setSearchResults(query, songsData, artistsData, albumsData);
      
      // Add to recent searches
      addRecentSearch(query);
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
  };

  const handleRecentSearchPress = (term: string) => {
    setSearchQuery(term);
  };

  const handleClearRecent = () => {
    clearRecentSearches();
  };

  const handleRemoveRecentSearch = (term: string) => {
    removeRecentSearch(term);
  };

  const handleSongMorePress = (song: Song) => {
    setSelectedSong(song);
    setShowSongOptions(true);
  };

  const handleAddToQueue = () => {
    if (selectedSong) {
      addToQueue(selectedSong);
      console.log('Added to queue:', selectedSong.name);
    }
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

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={handleClear}
          isFocused={isFocused}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>

      {/* Filter chips (shown when results exist) */}
      {hasSearched && hasResults && (
        <SearchFilterChips
          filters={SEARCH_FILTERS}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      )}

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Loading */}
        {loading && <SearchLoadingState />}

        {/* Recent Searches (shown when no query) */}
        {!loading && !hasSearched && (
          <RecentSearches
            searches={recentSearches}
            onSearchPress={handleRecentSearchPress}
            onRemoveSearch={handleRemoveRecentSearch}
            onClearAll={handleClearRecent}
          />
        )}

        {/* No results */}
        {!loading && hasSearched && !hasResults && (
          <SearchEmptyState query={searchQuery} />
        )}

        {/* Results */}
        {!loading && hasResults && (
          <SearchResultsList
            songs={songs}
            artists={artists}
            albums={albums}
            activeFilter={activeFilter}
            currentSongId={currentSong?.id}
            onSongPress={handleSongPress}
            onSongMorePress={handleSongMorePress}
            onArtistPress={handleArtistPress}
            onAlbumPress={handleAlbumPress}
          />
        )}
      </ScrollView>

      {/* Song Options Modal */}
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
});
