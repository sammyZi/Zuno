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

      // Set up notification playback controls
      const { NotificationService } = await import('../services/audio');
      NotificationService.setPlaybackControls({
        onPlay: async () => {
          console.log('[PlayerStore] Notification play pressed');
          await get().play();
        },
        onPause: async () => {
          console.log('[PlayerStore] Notification pause pressed');
          await get().pause();
        },
        onNext: async () => {
          console.log('[PlayerStore] Notification next pressed');
          const { useQueueStore } = await import('./queueStore');
          const nextSong = useQueueStore.getState().nextSong();
          if (nextSong) {
            await get().play(nextSong);
          }
        },
        onPrevious: async () => {
          console.log('[PlayerStore] Notification previous pressed');
          const { useQueueStore } = await import('./queueStore');
          const prevSong = useQueueStore.getState().previousSong();
          if (prevSong) {
            await get().play(prevSong);
          }
        },
      });

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
          set({ isPlaying: false, position: 0 });
          
          // Get next song from queue based on repeat mode
          const { useQueueStore } = await import('./queueStore');
          const queueState = useQueueStore.getState();
          const nextSong = queueState.nextSong();
          
          if (nextSong) {
            console.log('[PlayerStore] Auto-playing next song:', nextSong.name);
            // Small delay to prevent glitching
            await new Promise(resolve => setTimeout(resolve, 100));
            await get().play(nextSong);
          } else {
            // Queue ended - auto-populate with similar songs
            console.log('[PlayerStore] Queue ended, fetching similar songs...');
            const currentSong = get().currentSong;
            
            if (currentSong) {
              // Auto-populate suggestions
              await queueState.autoPopulateFromSuggestions(currentSong.id);
              
              // Get updated queue state
              const updatedQueueState = useQueueStore.getState();
              
              // Move to next index if queue was populated
              if (updatedQueueState.queue.length > updatedQueueState.currentIndex + 1) {
                updatedQueueState.setCurrentIndex(updatedQueueState.currentIndex + 1);
                const newNextSong = updatedQueueState.queue[updatedQueueState.currentIndex];
                
                if (newNextSong) {
                  console.log('[PlayerStore] Auto-playing suggested song:', newNextSong.name);
                  await new Promise(resolve => setTimeout(resolve, 100));
                  await get().play(newNextSong);
                } else {
                  console.log('[PlayerStore] No suggestions available, stopping playback');
                }
              } else {
                console.log('[PlayerStore] Failed to populate suggestions, stopping playback');
              }
            }
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
      set({ error: null, isLoading: true });

      // If new song, load it first
      if (!state.currentSong || state.currentSong.id !== targetSong.id) {
        // Stop current playback to prevent glitching
        if (state.isPlaying) {
          await AudioService.pauseAudio();
        }
        
        set({ currentSong: targetSong, position: 0, duration: 0, isPlaying: false });
        
        // Small delay to ensure clean transition
        await new Promise(resolve => setTimeout(resolve, 50));
        
        await AudioService.loadAudio(targetSong);
      }

      // Play the audio
      await AudioService.playAudio();
      set({ isPlaying: true, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to play audio';
      console.error('[PlayerStore] Play error:', errorMessage);
      set({ error: errorMessage, isPlaying: false, isLoading: false });
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
