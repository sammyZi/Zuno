/**
 * Search Store
 * Zustand store for managing search state
 */

import { create } from 'zustand';
import { Song } from '../types';

interface SearchState {
  // State
  searchQuery: string;
  searchResults: Song[];
  isSearching: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: Song[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  // Initial state
  searchQuery: '',
  searchResults: [],
  isSearching: false,

  // Actions
  setSearchQuery: (query) => set({ searchQuery: query }),

  setSearchResults: (results) =>
    set({
      searchResults: results,
      isSearching: false,
    }),

  setIsSearching: (isSearching) => set({ isSearching }),

  clearSearch: () =>
    set({
      searchQuery: '',
      searchResults: [],
      isSearching: false,
    }),
}));
