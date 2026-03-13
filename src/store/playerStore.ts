/**
 * Player Store
 * Zustand store for managing playback state
 */

import { create } from 'zustand';
import { Song } from '../types';

interface PlayerState {
  // State
  currentSong: Song | null;
  isPlaying: boolean;
  position: number; // Current playback position in seconds
  duration: number; // Total duration in seconds

  // Actions
  play: (song?: Song) => void;
  pause: () => void;
  togglePlayPause: () => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setCurrentSong: (song: Song | null) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  // Initial state
  currentSong: null,
  isPlaying: false,
  position: 0,
  duration: 0,

  // Actions
  play: (song) =>
    set((state) => ({
      isPlaying: true,
      currentSong: song ?? state.currentSong,
    })),

  pause: () => set({ isPlaying: false }),

  togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setPosition: (position) => set({ position }),

  setDuration: (duration) => set({ duration }),

  setCurrentSong: (song) =>
    set({
      currentSong: song,
      position: 0,
      duration: 0,
    }),

  reset: () =>
    set({
      currentSong: null,
      isPlaying: false,
      position: 0,
      duration: 0,
    }),
}));
