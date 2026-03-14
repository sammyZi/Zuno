import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Song } from '../types/api';

interface FavoritesState {
  favorites: Song[];
  addFavorite: (song: Song) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (song: Song) => void;
  isFavorite: (id: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (song) => {
        const current = get().favorites;
        if (!current.some((f) => f.id === song.id)) {
          set({ favorites: [song, ...current] });
        }
      },

      removeFavorite: (id) => {
        set({
          favorites: get().favorites.filter((s) => s.id !== id),
        });
      },

      toggleFavorite: (song) => {
        const isFav = get().isFavorite(song.id);
        if (isFav) {
          get().removeFavorite(song.id);
        } else {
          get().addFavorite(song);
        }
      },

      isFavorite: (id) => {
        return get().favorites.some((song) => song.id === id);
      },

      clearFavorites: () => {
        set({ favorites: [] });
      },
    }),
    {
      name: 'music-player-favorites',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
