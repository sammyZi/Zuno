/**
 * HomeScreen Component
 * Main screen with categories, search, and content sections
 * All items displayed as vertical lists with small image, name, play/3-dots
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList, TabParamList } from '../navigation/types';
import type { Song, Artist, Album } from '../types/api';
import { colors, spacing, borderRadius, typography } from '../theme';
import { CategoryTab } from '../components/home';
import { SongItem } from '../components/song';
import { LoadingSpinner, ErrorMessage } from '../components/common';
import { searchSongs, searchArtists, searchAlbums } from '../services/api';
import { getImageUrl, formatDuration, getArtistNames } from '../utils/audio';
import { usePlayerStore, useDataStore } from '../store';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  StackScreenProps<RootStackParamList>
>;

type Category = 'Suggested' | 'Songs' | 'Artists' | 'Albums';

const CATEGORIES: Category[] = ['Suggested', 'Songs', 'Artists', 'Albums'];
const ITEMS_PER_PAGE = 20;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('Suggested');
  const [songs, setSongs] = useState<Song[]>([]);
  const [suggestedSongs, setSuggestedSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { currentSong, play } = usePlayerStore();
  const {
    getSuggestedSongs: getCachedSuggestedSongs,
    getSongs: getCachedSongs,
    getArtists: getCachedArtists,
    getAlbums: getCachedAlbums,
    setSuggestedSongs: cacheSuggestedSongs,
    setSongs: cacheSongs,
    setArtists: cacheArtists,
    setAlbums: cacheAlbums,
  } = useDataStore();
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadInitialData();
  }, [selectedCategory]);

  const loadInitialData = async () => {
    // Check cache first
    let cachedData: Song[] | Artist[] | Album[] | null = null;
    
    if (selectedCategory === 'Suggested') {
      cachedData = getCachedSuggestedSongs();
    } else if (selectedCategory === 'Songs') {
      cachedData = getCachedSongs(1);
    } else if (selectedCategory === 'Artists') {
      cachedData = getCachedArtists(1);
    } else if (selectedCategory === 'Albums') {
      cachedData = getCachedAlbums(1);
    }

    // If we have cached data, use it
    if (cachedData && cachedData.length > 0) {
      if (selectedCategory === 'Suggested') {
        setSuggestedSongs(cachedData as Song[]);
      } else if (selectedCategory === 'Songs') {
        setSongs(cachedData as Song[]);
      } else if (selectedCategory === 'Artists') {
        setArtists(cachedData as Artist[]);
      } else if (selectedCategory === 'Albums') {
        setAlbums(cachedData as Album[]);
      }
      setPage(1);
      setHasMore(true);
      return;
    }

    // No cache, fetch from API
    setLoading(true);
    setError(null);
    setPage(1);
    setHasMore(true);

    try {
      if (selectedCategory === 'Suggested') {
        await loadSuggestedSongs();
      } else if (selectedCategory === 'Songs') {
        await loadSongs(1);
      } else if (selectedCategory === 'Artists') {
        await loadArtists(1);
      } else if (selectedCategory === 'Albums') {
        await loadAlbums(1);
      }
    } catch (err) {
      setError('Failed to load content. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestedSongs = async () => {
    const response = await searchSongs('trending', 1, 10);
    setSuggestedSongs(response.data.results);
    // Cache the data
    cacheSuggestedSongs(response.data.results);
  };

  const loadSongs = async (pageNum: number) => {
    const response = await searchSongs('latest', pageNum, ITEMS_PER_PAGE);
    if (pageNum === 1) {
      setSongs(response.data.results);
    } else {
      setSongs((prev) => [...prev, ...response.data.results]);
    }
    setHasMore(response.data.results.length === ITEMS_PER_PAGE);
    // Cache the data
    cacheSongs(response.data.results, pageNum);
  };

  const loadArtists = async (pageNum: number) => {
    const response = await searchArtists('popular', pageNum, ITEMS_PER_PAGE);
    if (pageNum === 1) {
      setArtists(response.data.results);
    } else {
      setArtists((prev) => [...prev, ...response.data.results]);
    }
    setHasMore(response.data.results.length === ITEMS_PER_PAGE);
    // Cache the data
    cacheArtists(response.data.results, pageNum);
  };

  const loadAlbums = async (pageNum: number) => {
    const response = await searchAlbums('latest', pageNum, ITEMS_PER_PAGE);
    if (pageNum === 1) {
      setAlbums(response.data.results);
    } else {
      setAlbums((prev) => [...prev, ...response.data.results]);
    }
    setHasMore(response.data.results.length === ITEMS_PER_PAGE);
    // Cache the data
    cacheAlbums(response.data.results, pageNum);
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || loading) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      if (selectedCategory === 'Songs') {
        await loadSongs(nextPage);
      } else if (selectedCategory === 'Artists') {
        await loadArtists(nextPage);
      } else if (selectedCategory === 'Albums') {
        await loadAlbums(nextPage);
      }
      setPage(nextPage);
    } catch (err) {
      console.error('Error loading more:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
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

  const handleSearchPress = () => {
    navigation.navigate('Search');
  };

  // ── Render: Suggested (vertical list of SongItems) ──
  const renderSuggestedSection = () => (
    <FlatList
      data={suggestedSongs}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <SongItem
          title={item.name}
          artist={getArtistNames(item)}
          duration={formatDuration(item.duration)}
          albumArtUri={getImageUrl(item.image)}
          onPress={() => handleSongPress(item)}
          onMorePress={() => console.log('More', item.name)}
          isPlaying={currentSong?.id === item.id}
          style={styles.listItem}
        />
      )}
      
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );

  // ── Render: Songs (vertical list) ──
  const renderSongsSection = () => (
    <FlatList
      data={songs}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <SongItem
          title={item.name}
          artist={getArtistNames(item)}
          duration={formatDuration(item.duration)}
          albumArtUri={getImageUrl(item.image)}
          onPress={() => handleSongPress(item)}
          onMorePress={() => console.log('More', item.name)}
          isPlaying={currentSong?.id === item.id}
          style={styles.listItem}
        />
      )}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );

  // ── Render: Artists (vertical list with square image + name + dots) ──
  const renderArtistsSection = () => (
    <FlatList
      data={artists}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const imageUri = getImageUrl(item.image);
        return (
          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => handleArtistPress(item)}
            activeOpacity={0.7}
          >
            {/* Square image */}
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.rowImage} />
            ) : (
              <View style={[styles.rowImage, styles.rowImagePlaceholder]}>
                <Text style={styles.placeholderLetter}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {/* Name */}
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.rowSubtitle} numberOfLines={1}>
                Artist
              </Text>
            </View>
            {/* Play button */}
            <TouchableOpacity style={styles.rowPlayButton} activeOpacity={0.7}>
              <Ionicons name="play" size={14} color={colors.backgroundPrimary} />
            </TouchableOpacity>
            {/* 3 dots */}
            <TouchableOpacity
              style={styles.rowMoreButton}
              activeOpacity={0.7}
              onPress={() => console.log('More', item.name)}
            >
              <Ionicons name="ellipsis-vertical" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </TouchableOpacity>
        );
      }}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );

  // ── Render: Albums (vertical list with square image + name + artist + dots) ──
  const renderAlbumsSection = () => (
    <FlatList
      data={albums}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const imageUri = getImageUrl(item.image);
        return (
          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => handleAlbumPress(item)}
            activeOpacity={0.7}
          >
            {/* Square image */}
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.rowImage} />
            ) : (
              <View style={[styles.rowImage, styles.rowImagePlaceholder]}>
                <Text style={styles.placeholderLetter}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {/* Name + artist */}
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.rowSubtitle} numberOfLines={1}>
                {item.primaryArtists || 'Album'}
              </Text>
            </View>
            {/* Play button */}
            <TouchableOpacity style={styles.rowPlayButton} activeOpacity={0.7}>
              <Ionicons name="play" size={14} color={colors.backgroundPrimary} />
            </TouchableOpacity>
            {/* 3 dots */}
            <TouchableOpacity
              style={styles.rowMoreButton}
              activeOpacity={0.7}
              onPress={() => console.log('More', item.name)}
            >
              <Ionicons name="ellipsis-vertical" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </TouchableOpacity>
        );
      }}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>Loading {selectedCategory}...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <ErrorMessage message={error} onRetry={loadInitialData} />
        </View>
      );
    }

    switch (selectedCategory) {
      case 'Suggested':
        return renderSuggestedSection();
      case 'Songs':
        return renderSongsSection();
      case 'Artists':
        return renderArtistsSection();
      case 'Albums':
        return renderAlbumsSection();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundPrimary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.appNameContainer}>
          <Ionicons name="musical-note" size={28} color={colors.primary} />
          <Text style={styles.appName}>Vibe</Text>
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearchPress}
          activeOpacity={0.7}
        >
          <Ionicons name="search-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categorySlider}
        >
          {CATEGORIES.map((category) => (
            <CategoryTab
              key={category}
              label={category}
              isActive={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>{renderContent()}</View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
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
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryWrapper: {
    paddingBottom: spacing.md,
  },
  categorySlider: {
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  listItem: {
  },

  /* Generic row item (Artists / Albums) — flat, no card bg */
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  rowImage: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.small,
    backgroundColor: colors.backgroundTertiary,
  },
  rowImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
  },
  placeholderLetter: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.primary,
  },
  rowInfo: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  rowTitle: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
  },
  rowPlayButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  rowMoreButton: {
    padding: spacing.xs,
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  loadingMore: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
