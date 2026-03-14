/**
 * History Store
 * Tracks recently played songs with persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Song } from '../types/api';

interface HistoryState {
  recentlyPlayed: Song[];
  addToHistory: (song: Song) => void;
  clearHistory: () => void;
  getRecentlyPlayed: (limit?: number) => Song[];
}

const MAX_HISTORY = 50;

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      recentlyPlayed: [],

      addToHistory: (song) =>
        set((state) => {
          // Remove song if it already exists
          const filtered = state.recentlyPlayed.filter((s) => s.id !== song.id);
          
          // Add to beginning
          const newHistory = [song, ...filtered];
          
          // Keep only MAX_HISTORY items
          return {
            recentlyPlayed: newHistory.slice(0, MAX_HISTORY),
          };
        }),

      clearHistory: () => set({ recentlyPlayed: [] }),

      getRecentlyPlayed: (limit = 10) => {
        const { recentlyPlayed } = get();
        return recentlyPlayed.slice(0, limit);
      },
    }),
    {
      name: 'music-player-history',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
