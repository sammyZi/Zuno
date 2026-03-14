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
import { isOnline, subscribeToNetworkStatus } from '../utils/network';
import { DownloadService } from '../services/storage';
import { usePlayerStore, useDataStore, useQueueStore, useHistoryStore, useDownloadStore } from '../store';

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
  const [isOffline, setIsOffline] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortOption, setSortOption] = useState('Ascending');
  const [artistSortOption, setArtistSortOption] = useState('Date Added');
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showSongOptions, setShowSongOptions] = useState(false);
  
  // Multi-select state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());

  const { currentSong, play } = usePlayerStore();
  const { addToQueue, playAndBuildQueue } = useQueueStore();
  const { getRecentlyPlayed } = useHistoryStore();
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

  // Monitor network status
  useEffect(() => {
    const checkNetwork = async () => {
      const online = await isOnline();
      setIsOffline(!online);
      
      // If offline and on Songs category, load downloaded songs
      if (!online && selectedCategory === 'Songs') {
        await loadDownloadedSongs();
      }
    };

    checkNetwork();

    // Subscribe to network changes
    const unsubscribe = subscribeToNetworkStatus((connected) => {
      setIsOffline(!connected);
      
      // If went offline and on Songs category, switch to downloaded songs
      if (!connected && selectedCategory === 'Songs') {
        loadDownloadedSongs();
      } else if (connected && selectedCategory === 'Songs') {
        // If back online, reload from API
        loadInitialData();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [selectedCategory]);

  const loadDownloadedSongs = async () => {
    try {
      setLoading(true);
      await DownloadService.initialize();
      const downloads = DownloadService.getAllDownloads();
      const downloadedSongs = downloads.map(d => d.song);
      setSongs(downloadedSongs);
      setHasMore(false); // No pagination for offline
    } catch (error) {
      console.error('Error loading downloaded songs:', error);
      setError('Failed to load downloaded songs');
    } finally {
      setLoading(false);
    }
  };

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
    if (selectionMode) {
      toggleSongSelection(song.id);
      return;
    }
    playAndBuildQueue(song, contextList);
    play(song);
    navigation.navigate('Player', { song });
  };

  const handleArtistPress = (artist: Artist) => {
    navigation.navigate('Artist', { 
      artistId: artist.id,
      artistName: artist.name 
    });
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

  const { downloadSong, deleteDownload, isDownloaded, isDownloading } = useDownloadStore();

  const handleDownloadSong = () => {
    if (selectedSong) {
      downloadSong(selectedSong);
    }
  };

  const handleDeleteDownload = () => {
    if (selectedSong) {
      deleteDownload(selectedSong.id);
    }
  };

  // Multi-select handlers
  const handleSongLongPress = (song: Song) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedSongs(new Set([song.id]));
    }
  };

  const toggleSongSelection = (songId: string) => {
    setSelectedSongs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(songId)) {
        newSet.delete(songId);
      } else {
        newSet.add(songId);
      }
      return newSet;
    });
  };

  const selectAllSongs = () => {
    setSelectedSongs(new Set(songs.map(s => s.id)));
  };

  const deselectAllSongs = () => {
    setSelectedSongs(new Set());
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedSongs(new Set());
  };

  const handleDownloadSelected = async () => {
    for (const songId of selectedSongs) {
      const song = songs.find(s => s.id === songId);
      if (song) {
        downloadSong(song);
      }
    }
    exitSelectionMode();
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
    // Get real recently played songs from history
    const recentlyPlayed = getRecentlyPlayed(5);
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
            <TouchableOpacity onPress={() => navigation.navigate('RecentlyPlayed')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentlyPlayed.length === 0 ? (
            <View style={styles.emptySection}>
              <Ionicons name="time-outline" size={32} color={colors.textMuted} />
              <Text style={styles.emptySectionText}>No recently played songs</Text>
              <Text style={styles.emptySectionSubtext}>Start playing music to see your history</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {recentlyPlayed.map((song, index) => {
                const imageUri = getImageUrl(song.image);
                return (
                  <TouchableOpacity
                    key={`recent-${song.id}-${index}`}
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
          )}
        </View>

        {/* Artists */}
        <View style={styles.suggestedSection}>
          <View style={styles.suggestedSectionHeader}>
            <Text style={styles.suggestedSectionTitle}>Artists</Text>
            <TouchableOpacity onPress={() => setSelectedCategory('Artists')}>
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
            <TouchableOpacity onPress={() => setSelectedCategory('Songs')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {mostPlayed.map((song, index) => {
              const imageUri = getImageUrl(song.image);
              return (
                <TouchableOpacity
                  key={`most-${song.id}-${index}`}
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
      {selectionMode ? (
        <>
          <Text style={styles.listHeaderCount}>
            {selectedSongs.size} selected
          </Text>
          <View style={styles.selectionActions}>
            {selectedSongs.size === songs.length ? (
              <TouchableOpacity onPress={deselectAllSongs} activeOpacity={0.7}>
                <Text style={styles.actionText}>Deselect All</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={selectAllSongs} activeOpacity={0.7}>
                <Text style={styles.actionText}>Select All</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      ) : (
        <>
          <Text style={styles.listHeaderCount}>{songs.length} songs</Text>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.sortButtonText}>{sortOption}</Text>
            <Ionicons name="swap-vertical" size={16} color={colors.primary} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  // ── Render: Songs (vertical list) ──
  const renderSongsSection = () => (
    <FlatList
      key="songs-list"
      data={songs}
      keyExtractor={(item, index) => `song-${item.id}-${index}`}
      ListHeaderComponent={renderSongsHeader}
      renderItem={({ item }) => {
        const isSelected = selectedSongs.has(item.id);
        return (
          <View style={styles.songItemWrapper}>
            {selectionMode && (
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => toggleSongSelection(item.id)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkboxInner,
                  isSelected && styles.checkboxSelected
                ]}>
                  {isSelected && (
                    <Ionicons name="checkmark" size={16} color={colors.textPrimary} />
                  )}
                </View>
              </TouchableOpacity>
            )}
            <SongItem
              song={item}
              title={item.name}
              artist={getArtistNames(item)}
              duration={formatDuration(item.duration)}
              albumArtUri={getImageUrl(item.image)}
              onPress={() => handleSongPress(item, songs)}
              onLongPress={() => handleSongLongPress(item)}
              onMorePress={selectionMode ? undefined : handleSongMorePress}
              isPlaying={currentSong?.id === item.id}
              style={styles.listItem}
              showMoreButton={!selectionMode}
            />
          </View>
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
      keyExtractor={(item, index) => `artist-${item.id}-${index}`}
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
              {item.songCount || 0} {item.songCount === 1 ? 'song' : 'songs'}
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
        {selectionMode && selectedCategory === 'Songs' ? (
          <View style={styles.selectionHeader}>
            <TouchableOpacity
              onPress={exitSelectionMode}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={28} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.appName}>Select Songs</Text>
            <TouchableOpacity
              onPress={handleDownloadSelected}
              disabled={selectedSongs.size === 0}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name="download-outline" 
                size={24} 
                color={selectedSongs.size > 0 ? colors.secondary : colors.textMuted} 
              />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.appNameContainer}>
              <Ionicons name="musical-notes" size={28} color={colors.primary} />
              <Text style={styles.appName}>Zuno</Text>
            </View>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearchPress}
              activeOpacity={0.7}
            >
              <Ionicons name="search-outline" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Offline Banner */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline" size={16} color={colors.textPrimary} />
          <Text style={styles.offlineBannerText}>
            {selectedCategory === 'Songs' 
              ? 'Offline - Showing downloaded songs only' 
              : 'You are offline'}
          </Text>
        </View>
      )}

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
        isDownloaded={selectedSong ? isDownloaded(selectedSong.id) : false}
        isDownloading={selectedSong ? isDownloading(selectedSong.id) : false}
        onClose={() => setShowSongOptions(false)}
        onDownload={handleDownloadSong}
        onDeleteDownload={handleDeleteDownload}
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
    fontFamily: 'Poppins_600SemiBold',
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
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warning + '20',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.medium,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.warning + '40',
  },
  offlineBannerText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: colors.textPrimary,
  },
  emptySection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.large,
    gap: spacing.sm,
  },
  emptySectionText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  emptySectionSubtext: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
  },
  
  // Multi-select styles
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  selectionActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.primary,
  },
  songItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
