/**
 * HomeScreen Component
 * Main screen matching Figma design with:
 *  - Suggested: Horizontal cards for Recently Played, Artists (circular), Most Played
 *  - Songs: Vertical list with count + sort options
 *  - Artists: Vertical list with circular images, album/song count
 *  - Albums: 2-column grid with album cards
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
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList, TabParamList } from '../navigation/types';
import type { Song, Artist, Album } from '../types/api';
import { colors, spacing, borderRadius, typography } from '../theme';
import { CategoryTab } from '../components/home';
import { SongItem, SongOptionsModal } from '../components/song';
import { LoadingSpinner, ErrorMessage } from '../components/common';
import { searchSongs, searchArtists, searchAlbums } from '../services/api';
import { getImageUrl, formatDuration, getArtistNames } from '../utils/audio';
import { usePlayerStore, useDataStore, useQueueStore } from '../store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ALBUM_CARD_WIDTH = (SCREEN_WIDTH - spacing.md * 3) / 2;

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  StackScreenProps<RootStackParamList>
>;

type Category = 'Suggested' | 'Songs' | 'Artists' | 'Albums';

const CATEGORIES: Category[] = ['Suggested', 'Songs', 'Artists', 'Albums'];
const ITEMS_PER_PAGE = 20;

const SORT_OPTIONS = [
  'Ascending',
  'Descending',
  'Artist',
  'Album',
  'Year',
  'Date Added',
  'Date Modified',
  'Composer',
];

const ARTIST_SORT_OPTIONS = [
  'Date Added',
  'Ascending',
  'Descending',
  'Most Songs',
  'Most Albums',
];

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
  const [sortOption, setSortOption] = useState('Ascending');
  const [artistSortOption, setArtistSortOption] = useState('Date Added');
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showSongOptions, setShowSongOptions] = useState(false);

  const { currentSong, play } = usePlayerStore();
  const { addToQueue, playAndBuildQueue } = useQueueStore();
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

  const handleSongPress = (song: Song, contextList?: Song[]) => {
    playAndBuildQueue(song, contextList);
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

  const handleSongMorePress = (song: Song) => {
    setSelectedSong(song);
    setShowSongOptions(true);
  };

  const handleAddToQueue = () => {
    if (selectedSong) {
      addToQueue(selectedSong, true); // Add as manual
      console.log('Added to queue:', selectedSong.name);
    }
  };

  // ── Sort Modal ──
  const renderSortModal = () => {
    const options = selectedCategory === 'Artists' ? ARTIST_SORT_OPTIONS : SORT_OPTIONS;
    const currentSort = selectedCategory === 'Artists' ? artistSortOption : sortOption;
    
    return (
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.sortModalContainer}>
            <View style={styles.sortModal}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.sortOption}
                  onPress={() => {
                    if (selectedCategory === 'Artists') {
                      setArtistSortOption(option);
                    } else {
                      setSortOption(option);
                    }
                    setShowSortModal(false);
                  }}
                >
                  <Text style={styles.sortOptionText}>{option}</Text>
                  <View style={[
                    styles.radioOuter,
                    currentSort === option && styles.radioOuterActive,
                  ]}>
                    {currentSort === option && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // ── Render: Suggested (horizontal scroll sections) ──
  const renderSuggestedSection = () => {
    // Split suggested songs into sections
    const recentlyPlayed = suggestedSongs.slice(0, 5);
    const artistsFromSongs = suggestedSongs.slice(0, 3);
    const mostPlayed = suggestedSongs.slice(3, 8);

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.suggestedContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Recently Played */}
        <View style={styles.suggestedSection}>
          <View style={styles.suggestedSectionHeader}>
            <Text style={styles.suggestedSectionTitle}>Recently Played</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {recentlyPlayed.map((song) => {
              const imageUri = getImageUrl(song.image);
              return (
                <TouchableOpacity
                  key={song.id}
                  style={styles.suggestedCard}
                  onPress={() => handleSongPress(song, recentlyPlayed)}
                  activeOpacity={0.7}
                >
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.suggestedCardImage} />
                  ) : (
                    <View style={[styles.suggestedCardImage, styles.suggestedCardPlaceholder]}>
                      <Ionicons name="musical-notes" size={32} color={colors.textMuted} />
                    </View>
                  )}
                  <Text style={styles.suggestedCardTitle} numberOfLines={2}>
                    {song.name}
                  </Text>
                  <Text style={styles.suggestedCardSubtitle} numberOfLines={1}>
                    {getArtistNames(song)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Artists */}
        <View style={styles.suggestedSection}>
          <View style={styles.suggestedSectionHeader}>
            <Text style={styles.suggestedSectionTitle}>Artists</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {artistsFromSongs.map((song, index) => {
              const imageUri = getImageUrl(song.image);
              const artistName = getArtistNames(song);
              return (
                <TouchableOpacity
                  key={`artist-${song.id}-${index}`}
                  style={styles.suggestedArtistCard}
                  onPress={() => handleSongPress(song, suggestedSongs)}
                  activeOpacity={0.7}
                >
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.suggestedArtistImage} />
                  ) : (
                    <View style={[styles.suggestedArtistImage, styles.suggestedCardPlaceholder]}>
                      <Ionicons name="person" size={32} color={colors.textMuted} />
                    </View>
                  )}
                  <Text style={styles.suggestedArtistName} numberOfLines={1}>
                    {artistName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Most Played */}
        <View style={styles.suggestedSection}>
          <View style={styles.suggestedSectionHeader}>
            <Text style={styles.suggestedSectionTitle}>Most Played</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {mostPlayed.map((song) => {
              const imageUri = getImageUrl(song.image);
              return (
                <TouchableOpacity
                  key={`most-${song.id}`}
                  style={styles.suggestedCard}
                  onPress={() => handleSongPress(song, mostPlayed)}
                  activeOpacity={0.7}
                >
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.suggestedCardImage} />
                  ) : (
                    <View style={[styles.suggestedCardImage, styles.suggestedCardPlaceholder]}>
                      <Ionicons name="musical-notes" size={32} color={colors.textMuted} />
                    </View>
                  )}
                  <Text style={styles.suggestedCardTitle} numberOfLines={2}>
                    {song.name}
                  </Text>
                  <Text style={styles.suggestedCardSubtitle} numberOfLines={1}>
                    {getArtistNames(song)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>
    );
  };

  // ── Render: Songs Header (count + sort) ──
  const renderSongsHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.listHeaderCount}>{songs.length} songs</Text>
      <TouchableOpacity
        style={styles.sortButton}
        onPress={() => setShowSortModal(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.sortButtonText}>{sortOption}</Text>
        <Ionicons name="swap-vertical" size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  // ── Render: Songs (vertical list) ──
  const renderSongsSection = () => (
    <FlatList
      key="songs-list"
      data={songs}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderSongsHeader}
      renderItem={({ item }) => (
        <SongItem
          song={item}
          title={item.name}
          artist={getArtistNames(item)}
          duration={formatDuration(item.duration)}
          albumArtUri={getImageUrl(item.image)}
          onPress={() => handleSongPress(item, songs)}
          onMorePress={() => handleSongMorePress(item)}
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

  // ── Render: Artists Header ──
  const renderArtistsHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.listHeaderCount}>{artists.length} artists</Text>
      <TouchableOpacity
        style={styles.sortButton}
        onPress={() => setShowSortModal(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.sortButtonText}>{artistSortOption}</Text>
        <Ionicons name="swap-vertical" size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  // ── Render: Artists (vertical list with circular images) ──
  const renderArtistsSection = () => (
    <FlatList
      key="artists-list"
      data={artists}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderArtistsHeader}
      renderItem={({ item }) => {
        const imageUri = getImageUrl(item.image);
        return (
          <TouchableOpacity
            style={styles.artistRowItem}
            onPress={() => handleArtistPress(item)}
            activeOpacity={0.7}
          >
            {/* Circular image */}
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.artistRowImage} />
            ) : (
              <View style={[styles.artistRowImage, styles.artistRowImagePlaceholder]}>
                <Text style={styles.placeholderLetter}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {/* Name + info */}
            <View style={styles.artistRowInfo}>
              <Text style={styles.artistRowTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.artistRowSubtitle} numberOfLines={1}>
                1 Album  |  12 Songs
              </Text>
            </View>
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

  // ── Render: Albums Header ──
  const renderAlbumsHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.listHeaderCount}>{albums.length} albums</Text>
      <TouchableOpacity
        style={styles.sortButton}
        onPress={() => setShowSortModal(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.sortButtonText}>Date Modified</Text>
        <Ionicons name="swap-vertical" size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  // ── Render: Albums (2-column grid) ──
  const renderAlbumsSection = () => (
    <FlatList
      key="albums-grid"
      data={albums}
      keyExtractor={(item) => item.id}
      numColumns={2}
      ListHeaderComponent={renderAlbumsHeader}
      columnWrapperStyle={styles.albumRow}
      renderItem={({ item }) => {
        const imageUri = getImageUrl(item.image);
        return (
          <TouchableOpacity
            style={styles.albumGridCard}
            onPress={() => handleAlbumPress(item)}
            activeOpacity={0.7}
          >
            {/* Album art */}
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.albumGridImage} />
            ) : (
              <View style={[styles.albumGridImage, styles.albumGridPlaceholder]}>
                <Ionicons name="disc" size={40} color={colors.textMuted} />
              </View>
            )}
            {/* Info row with name and 3-dot */}
            <View style={styles.albumGridInfoRow}>
              <Text style={styles.albumGridTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <TouchableOpacity
                onPress={() => console.log('More', item.name)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="ellipsis-vertical" size={14} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.albumGridSubtitle} numberOfLines={1}>
              {item.primaryArtists || 'Unknown'}  |  {item.year || '2023'}
            </Text>
            <Text style={styles.albumGridSongCount}>
              {item.songCount || '10'} songs
            </Text>
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
          <Ionicons name="musical-notes" size={28} color={colors.primary} />
          <Text style={styles.appName}>Mume</Text>
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
        <View style={styles.categoryDivider} />
      </View>

      {/* Content */}
      <View style={styles.content}>{renderContent()}</View>

      {/* Sort Modal */}
      {renderSortModal()}

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
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
    paddingBottom: 0,
  },
  categorySlider: {
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
  },
  categoryDivider: {
    height: 0.5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: spacing.md,
  },
  content: {
    flex: 1,
  },

  // ── List header (count + sort) ──
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

  // ── Sort Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  sortModalContainer: {
    position: 'absolute',
    top: 200,
    right: spacing.md,
  },
  sortModal: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.large,
    paddingVertical: spacing.sm,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  sortOptionText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: colors.textPrimary,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },

  // ── List content ──
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  listItem: {
  },

  // ── Suggested sections ──
  suggestedContent: {
    paddingBottom: 100,
  },
  suggestedSection: {
    marginBottom: spacing.lg,
  },
  suggestedSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  suggestedSectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: colors.textPrimary,
  },
  seeAllText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: colors.primary,
  },
  horizontalScroll: {
    paddingHorizontal: spacing.md,
  },
  suggestedCard: {
    width: 150,
    marginRight: spacing.md,
  },
  suggestedCardImage: {
    width: 150,
    height: 150,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.backgroundSecondary,
    marginBottom: spacing.sm,
  },
  suggestedCardPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
  },
  suggestedCardTitle: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  suggestedCardSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
  },

  // ── Suggested Artist Cards (circular) ──
  suggestedArtistCard: {
    width: 120,
    alignItems: 'center',
    marginRight: spacing.md,
  },
  suggestedArtistImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.backgroundSecondary,
    marginBottom: spacing.sm,
  },
  suggestedArtistName: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: colors.textPrimary,
    textAlign: 'center',
  },

  // ── Artist Row Items (circular image, Figma style) ──
  artistRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  artistRowImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.backgroundTertiary,
  },
  artistRowImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
  },
  placeholderLetter: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.primary,
  },
  artistRowInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  artistRowTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  artistRowSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
  },

  // ── Album Grid Items (2-column, Figma style) ──
  albumRow: {
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  albumGridCard: {
    width: ALBUM_CARD_WIDTH,
  },
  albumGridImage: {
    width: ALBUM_CARD_WIDTH,
    height: ALBUM_CARD_WIDTH,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.backgroundSecondary,
    marginBottom: spacing.sm,
  },
  albumGridPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
  },
  albumGridInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  albumGridTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 4,
  },
  albumGridSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
    marginTop: 2,
  },
  albumGridSongCount: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
    marginTop: 1,
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
