/**
 * Playback Hook
 * Custom hook that combines player and queue stores for common playback operations
 */

import { useCallback } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useQueueStore } from '../store/queueStore';
import { Song } from '../types';

export const usePlayback = () => {
  const { 
    currentSong, 
    isPlaying, 
    isLoading,
    position, 
    duration, 
    error,
    play, 
    pause, 
    togglePlayPause, 
    seekTo,
    setCurrentSong,
    initialize 
  } = usePlayerStore();

  const { queue, currentIndex, nextSong, previousSong, addToQueue, setQueue } = useQueueStore();

  /**
   * Play a specific song and optionally set it as the queue
   */
  const playSong = useCallback(
    (song: Song, replaceQueue = false) => {
      setCurrentSong(song);
      play(song);

      if (replaceQueue) {
        setQueue([song], 0);
      }
    },
    [setCurrentSong, play, setQueue]
  );

  /**
   * Play next song in queue
   */
  const playNext = useCallback(() => {
    const next = nextSong();
    if (next) {
      setCurrentSong(next);
      play(next);
    }
  }, [nextSong, setCurrentSong, play]);

  /**
   * Play previous song in queue
   */
  const playPrevious = useCallback(() => {
    const previous = previousSong();
    if (previous) {
      setCurrentSong(previous);
      play(previous);
    }
  }, [previousSong, setCurrentSong, play]);

  /**
   * Play a list of songs starting at a specific index
   */
  const playQueue = useCallback(
    (songs: Song[], startIndex = 0) => {
      if (songs.length === 0) return;

      setQueue(songs, startIndex);
      const songToPlay = songs[startIndex];
      setCurrentSong(songToPlay);
      play(songToPlay);
    },
    [setQueue, setCurrentSong, play]
  );

  /**
   * Add song to queue and optionally play it immediately
   */
  const addAndPlay = useCallback(
    (song: Song, playNow = false) => {
      addToQueue(song);

      if (playNow) {
        setCurrentSong(song);
        play(song);
      }
    },
    [addToQueue, setCurrentSong, play]
  );

  return {
    // State
    currentSong,
    isPlaying,
    isLoading,
    position,
    duration,
    error,
    queue,
    currentIndex,

    // Actions
    play,
    pause,
    togglePlayPause,
    seekTo,
    playSong,
    playNext,
    playPrevious,
    playQueue,
    addAndPlay,
    initialize,
  };
};
