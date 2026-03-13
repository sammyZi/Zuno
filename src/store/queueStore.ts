/**
 * Queue Store
 * Zustand store for managing playback queue with AsyncStorage persistence
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

  // Actions
  addToQueue: (song: Song | Song[]) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  nextSong: () => Song | null;
  previousSong: () => Song | null;
  setCurrentIndex: (index: number) => void;
  toggleShuffle: () => void;
  setRepeat: (mode: RepeatMode) => void;
  clearQueue: () => void;
  setQueue: (songs: Song[], startIndex?: number) => void;
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

      // Actions
      addToQueue: (song) =>
        set((state) => {
          const songs = Array.isArray(song) ? song : [song];
          const newQueue = [...state.queue, ...songs];
          return {
            queue: newQueue,
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

          return {
            queue: newQueue,
            currentIndex: newIndex,
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
        }),

      setQueue: (songs, startIndex = 0) =>
        set({
          queue: songs,
          currentIndex: startIndex,
          originalQueue: songs,
          shuffle: false,
        }),
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
      }),
    }
  )
);
