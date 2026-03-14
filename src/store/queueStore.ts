/**
 * Queue Store
 * Zustand store for managing playback queue with AsyncStorage persistence
 * Supports auto-populating with suggestions from the API
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../types';

export type RepeatMode = 'off' | 'all' | 'one';

interface QueueState {
  // State
  queue: Song[];
  currentIndex: number;
  shuffle: boolean;
  repeat: RepeatMode;
  originalQueue: Song[]; // Store original order for shuffle
  isLoadingSuggestions: boolean;
  manuallyAddedIndices: number[]; // Track indices of manually added songs

  // Actions
  addToQueue: (song: Song | Song[], isManual?: boolean) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  nextSong: () => Song | null;
  previousSong: () => Song | null;
  setCurrentIndex: (index: number) => void;
  toggleShuffle: () => void;
  setRepeat: (mode: RepeatMode) => void;
  clearQueue: () => void;
  setQueue: (songs: Song[], startIndex?: number) => void;
  playAndBuildQueue: (song: Song, contextSongs?: Song[]) => void;
  autoPopulateFromSuggestions: (songId: string) => Promise<void>;
}

export const useQueueStore = create<QueueState>()(
  persist(
    (set, get) => ({
      // Initial state
      queue: [],
      currentIndex: -1,
      shuffle: false,
      repeat: 'off',
      originalQueue: [],
      isLoadingSuggestions: false,
      manuallyAddedIndices: [],

      // Actions
      addToQueue: (song, isManual = false) =>
        set((state) => {
          const songs = Array.isArray(song) ? song : [song];
          let newQueue = [...state.queue];
          let insertIndex: number;
          let newManualIndices = [...state.manuallyAddedIndices];

          if (isManual) {
            // Find where to insert manually added songs
            if (newManualIndices.length === 0) {
              // First manual addition: insert right after current song
              insertIndex = state.currentIndex + 1;
            } else {
              // Subsequent manual additions: insert after the last manually added song
              const lastManualIndex = Math.max(...newManualIndices);
              insertIndex = lastManualIndex + 1;
            }

            // Insert songs at the calculated position
            newQueue.splice(insertIndex, 0, ...songs);

            // Update manual indices (shift existing indices if needed)
            newManualIndices = newManualIndices.map(idx => 
              idx >= insertIndex ? idx + songs.length : idx
            );
            
            // Add new manual indices
            for (let i = 0; i < songs.length; i++) {
              newManualIndices.push(insertIndex + i);
            }
          } else {
            // Auto-added songs: append to end
            newQueue = [...state.queue, ...songs];
          }

          return {
            queue: newQueue,
            manuallyAddedIndices: newManualIndices,
            originalQueue: state.shuffle ? [...state.originalQueue, ...songs] : newQueue,
          };
        }),

      removeFromQueue: (index) =>
        set((state) => {
          const newQueue = state.queue.filter((_, i) => i !== index);
          const newIndex =
            state.currentIndex === index
              ? Math.min(state.currentIndex, newQueue.length - 1)
              : state.currentIndex > index
                ? state.currentIndex - 1
                : state.currentIndex;

          // Update manual indices
          const newManualIndices = state.manuallyAddedIndices
            .filter(idx => idx !== index) // Remove the deleted index
            .map(idx => idx > index ? idx - 1 : idx); // Shift indices after deletion

          return {
            queue: newQueue,
            currentIndex: newIndex,
            manuallyAddedIndices: newManualIndices,
            originalQueue: state.shuffle
              ? state.originalQueue.filter((s) => s.id !== state.queue[index]?.id)
              : newQueue,
          };
        }),

      reorderQueue: (fromIndex, toIndex) =>
        set((state) => {
          const newQueue = [...state.queue];
          const [movedItem] = newQueue.splice(fromIndex, 1);
          newQueue.splice(toIndex, 0, movedItem);

          let newIndex = state.currentIndex;
          if (state.currentIndex === fromIndex) {
            newIndex = toIndex;
          } else if (fromIndex < state.currentIndex && toIndex >= state.currentIndex) {
            newIndex = state.currentIndex - 1;
          } else if (fromIndex > state.currentIndex && toIndex <= state.currentIndex) {
            newIndex = state.currentIndex + 1;
          }

          return {
            queue: newQueue,
            currentIndex: newIndex,
            originalQueue: state.shuffle ? state.originalQueue : newQueue,
          };
        }),

      nextSong: () => {
        const state = get();
        const { queue, currentIndex, repeat } = state;

        if (queue.length === 0) return null;

        // Repeat one - return current song
        if (repeat === 'one') {
          return queue[currentIndex] || null;
        }

        // Move to next song
        const nextIndex = currentIndex + 1;

        // If at end of queue
        if (nextIndex >= queue.length) {
          // Repeat all - go to start
          if (repeat === 'all') {
            set({ currentIndex: 0 });
            return queue[0];
          }
          // No repeat - stay at end
          return null;
        }

        // Normal next
        set({ currentIndex: nextIndex });
        return queue[nextIndex];
      },

      previousSong: () => {
        const state = get();
        const { queue, currentIndex } = state;

        if (queue.length === 0) return null;

        // If at start, go to end if repeat all
        if (currentIndex <= 0) {
          if (state.repeat === 'all') {
            const lastIndex = queue.length - 1;
            set({ currentIndex: lastIndex });
            return queue[lastIndex];
          }
          return queue[0];
        }

        // Normal previous
        const prevIndex = currentIndex - 1;
        set({ currentIndex: prevIndex });
        return queue[prevIndex];
      },

      setCurrentIndex: (index) => set({ currentIndex: index }),

      toggleShuffle: () =>
        set((state) => {
          const newShuffle = !state.shuffle;

          if (newShuffle) {
            // Enable shuffle - save original and shuffle queue
            const currentSong = state.queue[state.currentIndex];
            const originalQueue = [...state.queue];
            const shuffledQueue = [...state.queue];

            // Fisher-Yates shuffle
            for (let i = shuffledQueue.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffledQueue[i], shuffledQueue[j]] = [shuffledQueue[j], shuffledQueue[i]];
            }

            // Find new index of current song
            const newIndex = currentSong
              ? shuffledQueue.findIndex((s) => s.id === currentSong.id)
              : 0;

            return {
              shuffle: true,
              queue: shuffledQueue,
              originalQueue,
              currentIndex: newIndex >= 0 ? newIndex : 0,
            };
          } else {
            // Disable shuffle - restore original queue
            const currentSong = state.queue[state.currentIndex];
            const newIndex = currentSong
              ? state.originalQueue.findIndex((s) => s.id === currentSong.id)
              : 0;

            return {
              shuffle: false,
              queue: state.originalQueue,
              currentIndex: newIndex >= 0 ? newIndex : 0,
            };
          }
        }),

      setRepeat: (mode) => set({ repeat: mode }),

      clearQueue: () =>
        set({
          queue: [],
          currentIndex: -1,
          originalQueue: [],
          manuallyAddedIndices: [],
        }),

      setQueue: (songs, startIndex = 0) =>
        set({
          queue: songs,
          currentIndex: startIndex,
          originalQueue: songs,
          manuallyAddedIndices: [],
          shuffle: false,
        }),

      /**
       * Play a song and build a queue from context.
       * If contextSongs is provided (e.g. from a list, album, search results),
       * sets the full list as the queue.
       * If no context, sets just the played song and auto-populates suggestions.
       */
      playAndBuildQueue: (song, contextSongs) => {
        if (contextSongs && contextSongs.length > 0) {
          // Find the index of the song in the context
          const index = contextSongs.findIndex((s) => s.id === song.id);
          set({
            queue: contextSongs,
            currentIndex: index >= 0 ? index : 0,
            originalQueue: contextSongs,
            shuffle: false,
          });
        } else {
          // Single song — set it as queue, then auto-populate
          set({
            queue: [song],
            currentIndex: 0,
            originalQueue: [song],
            shuffle: false,
          });

          // Auto-populate suggestions in the background
          get().autoPopulateFromSuggestions(song.id);
        }
      },

      /**
       * Fetch song suggestions from the API and append to queue.
       * Deduplicates against existing queue songs.
       */
      autoPopulateFromSuggestions: async (songId) => {
        const state = get();
        if (state.isLoadingSuggestions) return;

        set({ isLoadingSuggestions: true });

        try {
          // Dynamic import to avoid circular deps
          const { getSongSuggestions } = await import('../services/api/songs');
          const suggestions = await getSongSuggestions(songId, 15);

          if (suggestions && suggestions.length > 0) {
            const currentState = get();
            const existingIds = new Set(currentState.queue.map((s) => s.id));
            const newSongs = suggestions.filter((s) => !existingIds.has(s.id));

            if (newSongs.length > 0) {
              const updatedQueue = [...currentState.queue, ...newSongs];
              set({
                queue: updatedQueue,
                originalQueue: currentState.shuffle ? currentState.originalQueue : updatedQueue,
              });
              console.log(`[QueueStore] Auto-populated ${newSongs.length} suggestions`);
            }
          }
        } catch (error) {
          console.warn('[QueueStore] Failed to fetch suggestions:', error);
        } finally {
          set({ isLoadingSuggestions: false });
        }
      },
    }),
    {
      name: 'queue-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist these fields
      partialize: (state) => ({
        queue: state.queue,
        currentIndex: state.currentIndex,
        shuffle: state.shuffle,
        repeat: state.repeat,
        originalQueue: state.originalQueue,
        manuallyAddedIndices: state.manuallyAddedIndices,
      }),
    }
  )
);
