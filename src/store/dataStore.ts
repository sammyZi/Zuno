/**
 * Data Store
 * Caches API responses to prevent unnecessary API calls when switching pages
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Song, Artist, Album } from '../types/api';

interface CachedData<T> {
  data: T;
  timestamp: number;
  page?: number;
}

interface SearchCache {
  query: string;
  songs: Song[];
  artists: Artist[];
  albums: Album[];
  timestamp: number;
}

interface DataState {
  // Cached data
  suggestedSongs: CachedData<Song[]> | null;
  songs: CachedData<Song[]> | null;
  artists: CachedData<Artist[]> | null;
  albums: CachedData<Album[]> | null;
  searchCache: SearchCache | null;
  
  // Cache duration (5 minutes)
  cacheDuration: number;
  
  // Actions
  setSuggestedSongs: (songs: Song[]) => void;
  setSongs: (songs: Song[], page: number) => void;
  setArtists: (artists: Artist[], page: number) => void;
  setAlbums: (albums: Album[], page: number) => void;
  setSearchResults: (query: string, songs: Song[], artists: Artist[], albums: Album[]) => void;
  
  // Getters with cache validation
  getSuggestedSongs: () => Song[] | null;
  getSongs: (page: number) => Song[] | null;
  getArtists: (page: number) => Artist[] | null;
  getAlbums: (page: number) => Album[] | null;
  getSearchResults: (query: string) => { songs: Song[]; artists: Artist[]; albums: Album[] } | null;
  
  // Clear cache
  clearCache: () => void;
  clearCategoryCache: (category: 'suggested' | 'songs' | 'artists' | 'albums') => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      // Initial state
      suggestedSongs: null,
      songs: null,
      artists: null,
      albums: null,
      searchCache: null,
      cacheDuration: CACHE_DURATION,

      // Set cached data
      setSuggestedSongs: (songs) =>
        set({
          suggestedSongs: {
            data: songs,
            timestamp: Date.now(),
          },
        }),

      setSongs: (songs, page) =>
        set((state) => {
          const existingData = state.songs?.data || [];
          const newData = page === 1 ? songs : [...existingData, ...songs];
          return {
            songs: {
              data: newData,
              timestamp: Date.now(),
              page,
            },
          };
        }),

      setArtists: (artists, page) =>
        set((state) => {
          const existingData = state.artists?.data || [];
          const newData = page === 1 ? artists : [...existingData, ...artists];
          return {
            artists: {
              data: newData,
              timestamp: Date.now(),
              page,
            },
          };
        }),

      setAlbums: (albums, page) =>
        set((state) => {
          const existingData = state.albums?.data || [];
          const newData = page === 1 ? albums : [...existingData, ...albums];
          return {
            albums: {
              data: newData,
              timestamp: Date.now(),
              page,
            },
          };
        }),

      setSearchResults: (query, songs, artists, albums) =>
        set({
          searchCache: {
            query: query.toLowerCase().trim(),
            songs,
            artists,
            albums,
            timestamp: Date.now(),
          },
        }),

      // Get cached data with validation
      getSuggestedSongs: () => {
        const cached = get().suggestedSongs;
        if (!cached) return null;
        
        const isExpired = Date.now() - cached.timestamp > get().cacheDuration;
        return isExpired ? null : cached.data;
      },

      getSongs: (page) => {
        const cached = get().songs;
        if (!cached) return null;
        
        const isExpired = Date.now() - cached.timestamp > get().cacheDuration;
        if (isExpired) return null;
        
        // Return cached data only if we have data for the requested page
        return cached.page && cached.page >= page ? cached.data : null;
      },

      getArtists: (page) => {
        const cached = get().artists;
        if (!cached) return null;
        
        const isExpired = Date.now() - cached.timestamp > get().cacheDuration;
        if (isExpired) return null;
        
        return cached.page && cached.page >= page ? cached.data : null;
      },

      getAlbums: (page) => {
        const cached = get().albums;
        if (!cached) return null;
        
        const isExpired = Date.now() - cached.timestamp > get().cacheDuration;
        if (isExpired) return null;
        
        return cached.page && cached.page >= page ? cached.data : null;
      },

      getSearchResults: (query) => {
        const cached = get().searchCache;
        if (!cached) return null;
        
        const isExpired = Date.now() - cached.timestamp > get().cacheDuration;
        if (isExpired) return null;
        
        const normalizedQuery = query.toLowerCase().trim();
        if (cached.query !== normalizedQuery) return null;
        
        return {
          songs: cached.songs,
          artists: cached.artists,
          albums: cached.albums,
        };
      },

      // Clear cache
      clearCache: () =>
        set({
          suggestedSongs: null,
          songs: null,
          artists: null,
          albums: null,
          searchCache: null,
        }),

      clearCategoryCache: (category) =>
        set((state) => ({
          ...state,
          [category === 'suggested' ? 'suggestedSongs' : category]: null,
        })),
    }),
    {
      name: 'data-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        suggestedSongs: state.suggestedSongs,
        songs: state.songs,
        artists: state.artists,
        albums: state.albums,
        searchCache: state.searchCache,
      }),
    }
  )
);
