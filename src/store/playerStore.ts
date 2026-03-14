/**
 * Player Store
 * Zustand store for managing playback state integrated with AudioService
 */

import { create } from 'zustand';
import { Song } from '../types';
import { AudioService } from '../services/audio';
import type { AVPlaybackStatusSuccess } from 'expo-av';

interface PlayerState {
  // State
  currentSong: Song | null;
  isPlaying: boolean;
  isLoading: boolean;
  position: number; // Current playback position in seconds
  duration: number; // Total duration in seconds
  error: string | null;

  // Actions
  play: (song?: Song) => Promise<void>;
  pause: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekTo: (positionSeconds: number) => Promise<void>;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  // Initial state
  currentSong: null,
  isPlaying: false,
  isLoading: false,
  position: 0,
  duration: 0,
  error: null,

  // Initialize audio service and set up callbacks
  initialize: async () => {
    try {
      await AudioService.initialize();

      // Set up audio service callbacks
      AudioService.setCallbacks({
        onPlaybackStatusUpdate: (status: AVPlaybackStatusSuccess) => {
          const state = get();
          
          // Update position (convert from milliseconds to seconds)
          const newPosition = status.positionMillis / 1000;
          if (Math.abs(newPosition - state.position) > 0.5) {
            set({ position: newPosition });
          }

          // Update duration (convert from milliseconds to seconds)
          if (status.durationMillis) {
            const newDuration = status.durationMillis / 1000;
            if (state.duration !== newDuration) {
              set({ duration: newDuration });
            }
          }

          // Update playing state
          if (state.isPlaying !== status.isPlaying) {
            set({ isPlaying: status.isPlaying });
          }
        },

        onPlaybackEnd: async () => {
          console.log('[PlayerStore] Playback ended');
          set({ isPlaying: false });
          
          // Get next song from queue based on repeat mode
          const { useQueueStore } = await import('./queueStore');
          const nextSong = useQueueStore.getState().nextSong();
          
          if (nextSong) {
            console.log('[PlayerStore] Auto-playing next song:', nextSong.name);
            // Play next song
            await get().play(nextSong);
          } else {
            console.log('[PlayerStore] No next song, stopping playback');
            set({ position: 0 });
          }
        },

        onError: (error: string) => {
          console.error('[PlayerStore] Audio error:', error);
          set({ error, isPlaying: false, isLoading: false });
        },

        onLoading: (isLoading: boolean) => {
          set({ isLoading });
        },
      });

      console.log('[PlayerStore] Initialized with AudioService');
    } catch (error) {
      console.error('[PlayerStore] Initialization failed:', error);
      set({ error: 'Failed to initialize audio service' });
    }
  },

  // Play audio (optionally with a new song)
  play: async (song) => {
    const state = get();
    const targetSong = song ?? state.currentSong;

    if (!targetSong) {
      console.warn('[PlayerStore] No song to play');
      return;
    }

    try {
      set({ error: null });

      // If new song, load it first
      if (!state.currentSong || state.currentSong.id !== targetSong.id) {
        set({ currentSong: targetSong, position: 0, duration: 0 });
        await AudioService.loadAudio(targetSong);
      }

      // Play the audio
      await AudioService.playAudio();
      set({ isPlaying: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to play audio';
      console.error('[PlayerStore] Play error:', errorMessage);
      set({ error: errorMessage, isPlaying: false });
    }
  },

  // Pause audio
  pause: async () => {
    try {
      await AudioService.pauseAudio();
      set({ isPlaying: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to pause audio';
      console.error('[PlayerStore] Pause error:', errorMessage);
      set({ error: errorMessage });
    }
  },

  // Toggle play/pause
  togglePlayPause: async () => {
    const state = get();
    if (state.isPlaying) {
      await state.pause();
    } else {
      await state.play();
    }
  },

  // Seek to position (in seconds)
  seekTo: async (positionSeconds: number) => {
    try {
      const positionMillis = positionSeconds * 1000;
      await AudioService.seekTo(positionMillis);
      set({ position: positionSeconds });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to seek';
      console.error('[PlayerStore] Seek error:', errorMessage);
      set({ error: errorMessage });
    }
  },

  // Setters for direct state updates
  setPosition: (position) => set({ position }),

  setDuration: (duration) => set({ duration }),

  setCurrentSong: (song) =>
    set({
      currentSong: song,
      position: 0,
      duration: 0,
    }),

  setIsPlaying: (isPlaying) => set({ isPlaying }),

  setIsLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  // Reset player state
  reset: async () => {
    try {
      await AudioService.stopAudio();
      set({
        currentSong: null,
        isPlaying: false,
        isLoading: false,
        position: 0,
        duration: 0,
        error: null,
      });
    } catch (error) {
      console.error('[PlayerStore] Reset error:', error);
    }
  },
}));
