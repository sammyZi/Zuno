/**
 * Download Store
 * Manages download state using Zustand
 */

import { create } from 'zustand';
import { Song } from '../types';
import { DownloadService, DownloadProgress } from '../services/storage';

interface DownloadState {
  // Download progress tracking
  downloadProgress: Map<string, DownloadProgress>;
  
  // Downloaded songs set for quick lookup
  downloadedSongs: Set<string>;
  
  // Actions
  initializeDownloads: () => Promise<void>;
  downloadSong: (song: Song) => Promise<void>;
  cancelDownload: (songId: string) => Promise<void>;
  deleteDownload: (songId: string) => Promise<void>;
  isDownloaded: (songId: string) => boolean;
  isDownloading: (songId: string) => boolean;
  getProgress: (songId: string) => number;
  refreshDownloads: () => Promise<void>;
}

export const useDownloadStore = create<DownloadState>((set, get) => ({
  downloadProgress: new Map(),
  downloadedSongs: new Set(),

  initializeDownloads: async () => {
    try {
      await DownloadService.initialize();
      const downloads = DownloadService.getAllDownloads();
      const downloadedSet = new Set(downloads.map(d => d.songId));
      set({ downloadedSongs: downloadedSet });
      console.log('[DownloadStore] Initialized with', downloadedSet.size, 'downloads');
    } catch (error) {
      console.error('[DownloadStore] Initialization error:', error);
    }
  },

  downloadSong: async (song: Song) => {
    const { downloadProgress, downloadedSongs } = get();

    // Check if already downloaded or downloading
    if (downloadedSongs.has(song.id) || downloadProgress.has(song.id)) {
      return;
    }

    try {
      await DownloadService.downloadSong(
        song,
        // Progress callback
        (progress) => {
          const newProgress = new Map(get().downloadProgress);
          newProgress.set(song.id, progress);
          set({ downloadProgress: newProgress });
        },
        // Completion callback
        (songId, success, error) => {
          const newProgress = new Map(get().downloadProgress);
          newProgress.delete(songId);
          
          if (success) {
            const newDownloaded = new Set(get().downloadedSongs);
            newDownloaded.add(songId);
            set({ 
              downloadProgress: newProgress,
              downloadedSongs: newDownloaded 
            });
            console.log('[DownloadStore] Download complete:', songId);
          } else {
            set({ downloadProgress: newProgress });
            console.error('[DownloadStore] Download failed:', error);
          }
        }
      );
    } catch (error) {
      console.error('[DownloadStore] Download error:', error);
      const newProgress = new Map(get().downloadProgress);
      newProgress.delete(song.id);
      set({ downloadProgress: newProgress });
    }
  },

  cancelDownload: async (songId: string) => {
    try {
      await DownloadService.cancelDownload(songId);
      const newProgress = new Map(get().downloadProgress);
      newProgress.delete(songId);
      set({ downloadProgress: newProgress });
      console.log('[DownloadStore] Download cancelled:', songId);
    } catch (error) {
      console.error('[DownloadStore] Cancel error:', error);
    }
  },

  deleteDownload: async (songId: string) => {
    try {
      await DownloadService.deleteDownload(songId);
      const newDownloaded = new Set(get().downloadedSongs);
      newDownloaded.delete(songId);
      set({ downloadedSongs: newDownloaded });
      console.log('[DownloadStore] Download deleted:', songId);
    } catch (error) {
      console.error('[DownloadStore] Delete error:', error);
    }
  },

  isDownloaded: (songId: string) => {
    return get().downloadedSongs.has(songId);
  },

  isDownloading: (songId: string) => {
    return get().downloadProgress.has(songId);
  },

  getProgress: (songId: string) => {
    const progress = get().downloadProgress.get(songId);
    return progress?.progress || 0;
  },

  refreshDownloads: async () => {
    const downloads = DownloadService.getAllDownloads();
    const downloadedSet = new Set(downloads.map(d => d.songId));
    set({ downloadedSongs: downloadedSet });
  },
}));
