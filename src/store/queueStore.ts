/**
 * Queue Store
 * Zustand store for managing playback queue with AsyncStorage persistence
 * Supports auto-populating with suggestions from the API
 */

import { create } from 'zustand';
import { Song } from '../types';

export type RepeatMode = 'off' | 'all' | 'one';

interface QueueState {
  // State
  queue: Song[];
  currentIndex: number;
  shuffle: boolean;
  repeat: RepeatMode;
  originalQueue: Song[]; // Store original order for shuffle
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
  resetQueue: () => void;
  setQueue: (songs: Song[], startIndex?: number) => void;
  playAndBuildQueue: (song: Song, contextSongs?: Song[]) => void;
}

export const useQueueStore = create<QueueState>()((set, get) => ({
  // Initial state
  queue: [],
  currentIndex: -1,
  shuffle: false,
  repeat: 'off',
  originalQueue: [],
  manuallyAddedIndices: [],

      // Actions
      addToQueue: (song, isManual = false) =>
        set((state) => {
          const songs = Array.isArray(song) ? song : [song];
          
          // Validate songs - filter out any undefined/null/invalid songs
          const validSongs = songs.filter(s => s && s.id && s.name);
          
          if (validSongs.length === 0) {
            console.warn('[QueueStore] Attempted to add invalid songs to queue');
            return state; // Return unchanged state
          }
          
          if (validSongs.length < songs.length) {
            console.warn('[QueueStore] Filtered out', songs.length - validSongs.length, 'invalid songs');
          }
          
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
            newQueue.splice(insertIndex, 0, ...validSongs);

            // Update manual indices (shift existing indices if needed)
            newManualIndices = newManualIndices.map(idx => 
              idx >= insertIndex ? idx + validSongs.length : idx
            );
            
            // Add new manual indices
            for (let i = 0; i < validSongs.length; i++) {
              newManualIndices.push(insertIndex + i);
            }
          } else {
            // Auto-added songs (from context/albums): append to end
            newQueue = [...state.queue, ...validSongs];
          }

          return {
            queue: newQueue,
            manuallyAddedIndices: newManualIndices,
            originalQueue: state.shuffle ? [...state.originalQueue, ...validSongs] : newQueue,
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

          // Update current index if needed
          let newIndex = state.currentIndex;
          if (state.currentIndex === fromIndex) {
            newIndex = toIndex;
          } else if (fromIndex < state.currentIndex && toIndex >= state.currentIndex) {
            newIndex = state.currentIndex - 1;
          } else if (fromIndex > state.currentIndex && toIndex <= state.currentIndex) {
            newIndex = state.currentIndex + 1;
          }

          // Update manual indices
          const newManualIndices = state.manuallyAddedIndices.map(idx => {
            if (idx === fromIndex) return toIndex;
            if (fromIndex < idx && toIndex >= idx) return idx - 1;
            if (fromIndex > idx && toIndex <= idx) return idx + 1;
            return idx;
          });

          return {
            queue: newQueue,
            currentIndex: newIndex,
            manuallyAddedIndices: newManualIndices,
            originalQueue: state.shuffle ? state.originalQueue : newQueue,
          };
        }),

      nextSong: () => {
        const state = get();
        const { queue, currentIndex, repeat } = state;

        console.log('[QueueStore] nextSong called - repeat:', repeat, 'currentIndex:', currentIndex, 'queueLength:', queue.length);

        if (queue.length === 0) return null;

        // Repeat one - return current song
        if (repeat === 'one') {
          console.log('[QueueStore] Repeat one - returning current song:', queue[currentIndex]?.name);
          return queue[currentIndex] || null;
        }

        // Move to next song
        const nextIndex = currentIndex + 1;

        // If at end of queue
        if (nextIndex >= queue.length) {
          // Repeat all - go to start
          if (repeat === 'all') {
            console.log('[QueueStore] Repeat all - going to start');
            set({ currentIndex: 0 });
            return queue[0];
          }
          // No repeat - return null
          console.log('[QueueStore] No repeat - queue ended');
          return null;
        }

        // Normal next
        console.log('[QueueStore] Normal next - moving to index:', nextIndex);
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

      resetQueue: () => {
        // Reset queue but keep current song if playing
        const state = get();
        if (state.currentIndex >= 0 && state.queue[state.currentIndex]) {
          const currentSong = state.queue[state.currentIndex];
          set({
            queue: [currentSong],
            currentIndex: 0,
            originalQueue: [currentSong],
            manuallyAddedIndices: [],
            shuffle: false,
          });
        } else {
          set({
            queue: [],
            currentIndex: -1,
            originalQueue: [],
            manuallyAddedIndices: [],
            shuffle: false,
          });
        }
      },

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
       * If no context, sets just the played song without auto-populating.
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
          // Single song — set it as queue only
          set({
            queue: [song],
            currentIndex: 0,
            originalQueue: [song],
            shuffle: false,
          });
        }
      },
    }));
