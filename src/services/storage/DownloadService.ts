/**
 * Download Service
 * Manages offline song downloads with progress tracking
 */

import { Paths, Directory, File } from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../../types';
import { getAudioUrl } from '../../utils/audio';

const DOWNLOADS_DIR_NAME = 'downloads';
const DOWNLOADS_INDEX_KEY = '@downloads_index';

export interface DownloadProgress {
  songId: string;
  progress: number; // 0-100
  totalBytes: number;
  downloadedBytes: number;
}

export interface DownloadedSong {
  songId: string;
  localUri: string;
  downloadedAt: number;
  song: Song;
}

type ProgressCallback = (progress: DownloadProgress) => void;
type CompletionCallback = (songId: string, success: boolean, error?: string) => void;

class DownloadServiceClass {
  private downloadIndex: Map<string, DownloadedSong> = new Map();
  private activeDownloads: Map<string, AbortController> = new Map();
  private progressCallbacks: Map<string, ProgressCallback> = new Map();
  private completionCallbacks: Map<string, CompletionCallback> = new Map();
  private isInitialized = false;
  private downloadsDir: Directory | null = null;

  /**
   * Initialize download service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Create downloads directory if it doesn't exist
      this.downloadsDir = new Directory(Paths.document, DOWNLOADS_DIR_NAME);
      
      if (!this.downloadsDir.exists) {
        await this.downloadsDir.create();
        console.log('[DownloadService] Created downloads directory');
      }

      // Load download index from storage
      await this.loadDownloadIndex();
      
      this.isInitialized = true;
      console.log('[DownloadService] Initialized with', this.downloadIndex.size, 'downloads');
    } catch (error) {
      console.error('[DownloadService] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Load download index from AsyncStorage
   */
  private async loadDownloadIndex(): Promise<void> {
    try {
      const indexJson = await AsyncStorage.getItem(DOWNLOADS_INDEX_KEY);
      if (indexJson) {
        const indexArray: DownloadedSong[] = JSON.parse(indexJson);
        this.downloadIndex = new Map(indexArray.map(item => [item.songId, item]));
        
        // Verify files still exist
        const validDownloads: DownloadedSong[] = [];
        for (const download of indexArray) {
          try {
            const file = new File(download.localUri);
            if (file.exists) {
              validDownloads.push(download);
            } else {
              console.warn('[DownloadService] File missing for song:', download.songId);
            }
          } catch (error) {
            console.warn('[DownloadService] Error checking file:', error);
          }
        }
        
        // Update index with only valid downloads
        this.downloadIndex = new Map(validDownloads.map(item => [item.songId, item]));
        await this.saveDownloadIndex();
      }
    } catch (error) {
      console.error('[DownloadService] Error loading download index:', error);
      this.downloadIndex = new Map();
    }
  }

  /**
   * Save download index to AsyncStorage
   */
  private async saveDownloadIndex(): Promise<void> {
    try {
      const indexArray = Array.from(this.downloadIndex.values());
      await AsyncStorage.setItem(DOWNLOADS_INDEX_KEY, JSON.stringify(indexArray));
    } catch (error) {
      console.error('[DownloadService] Error saving download index:', error);
    }
  }

  /**
   * Download a song
   */
  async downloadSong(
    song: Song,
    onProgress?: ProgressCallback,
    onComplete?: CompletionCallback
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Check if already downloaded
    if (this.isDownloaded(song.id)) {
      console.log('[DownloadService] Song already downloaded:', song.name);
      onComplete?.(song.id, true);
      return;
    }

    // Check if already downloading
    if (this.activeDownloads.has(song.id)) {
      console.log('[DownloadService] Song already downloading:', song.name);
      return;
    }

    try {
      // Get audio URL
      const audioUrl = getAudioUrl(song);
      if (!audioUrl) {
        throw new Error('No audio URL available for this song');
      }

      // Create local file path
      const fileName = `${song.id}.mp3`;
      const file = new File(this.downloadsDir!, fileName);

      console.log('[DownloadService] Starting download:', song.name);

      // Store callbacks
      if (onProgress) {
        this.progressCallbacks.set(song.id, onProgress);
      }
      if (onComplete) {
        this.completionCallbacks.set(song.id, onComplete);
      }

      // Create abort controller for cancellation
      const abortController = new AbortController();
      this.activeDownloads.set(song.id, abortController);

      // Report initial progress
      onProgress?.({
        songId: song.id,
        progress: 0,
        totalBytes: 0,
        downloadedBytes: 0,
      });

      // Download file using fetch with proper React Native handling
      const response = await fetch(audioUrl, {
        signal: abortController.signal,
      });
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Get the response as text (base64) since React Native doesn't support arrayBuffer on blob
      const blob = await response.blob();
      
      // Use FileReader to convert blob to base64 in React Native
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          // Remove data URL prefix if present
          const base64 = result.includes(',') ? result.split(',')[1] : result;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      // Write base64 data to file
      file.write(base64Data);

      // Report completion progress
      onProgress?.({
        songId: song.id,
        progress: 100,
        totalBytes: base64Data.length,
        downloadedBytes: base64Data.length,
      });

      // Download successful
      const downloadedSong: DownloadedSong = {
        songId: song.id,
        localUri: file.uri,
        downloadedAt: Date.now(),
        song,
      };

      this.downloadIndex.set(song.id, downloadedSong);
      await this.saveDownloadIndex();

      console.log('[DownloadService] Download complete:', song.name);
      
      const callback = this.completionCallbacks.get(song.id);
      callback?.(song.id, true);
    } catch (error) {
      console.error('[DownloadService] Download error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      
      const callback = this.completionCallbacks.get(song.id);
      callback?.(song.id, false, errorMessage);
    } finally {
      // Cleanup
      this.activeDownloads.delete(song.id);
      this.progressCallbacks.delete(song.id);
      this.completionCallbacks.delete(song.id);
    }
  }

  /**
   * Cancel an active download
   */
  async cancelDownload(songId: string): Promise<void> {
    const abortController = this.activeDownloads.get(songId);
    if (abortController) {
      try {
        abortController.abort();
        this.activeDownloads.delete(songId);
        this.progressCallbacks.delete(songId);
        this.completionCallbacks.delete(songId);
        console.log('[DownloadService] Download cancelled:', songId);
      } catch (error) {
        console.error('[DownloadService] Error cancelling download:', error);
      }
    }
  }

  /**
   * Delete a downloaded song
   */
  async deleteDownload(songId: string): Promise<void> {
    const download = this.downloadIndex.get(songId);
    if (!download) {
      return;
    }

    try {
      // Delete file
      const file = new File(download.localUri);
      if (file.exists) {
        await file.delete();
      }

      // Remove from index
      this.downloadIndex.delete(songId);
      await this.saveDownloadIndex();

      console.log('[DownloadService] Download deleted:', songId);
    } catch (error) {
      console.error('[DownloadService] Error deleting download:', error);
      throw error;
    }
  }

  /**
   * Check if a song is downloaded
   */
  isDownloaded(songId: string): boolean {
    return this.downloadIndex.has(songId);
  }

  /**
   * Check if a song is currently downloading
   */
  isDownloading(songId: string): boolean {
    return this.activeDownloads.has(songId);
  }

  /**
   * Get local URI for a downloaded song
   */
  getLocalUri(songId: string): string | null {
    const download = this.downloadIndex.get(songId);
    return download?.localUri || null;
  }

  /**
   * Get all downloaded songs
   */
  getAllDownloads(): DownloadedSong[] {
    return Array.from(this.downloadIndex.values());
  }

  /**
   * Get download info for a song
   */
  getDownloadInfo(songId: string): DownloadedSong | null {
    return this.downloadIndex.get(songId) || null;
  }

  /**
   * Clear all downloads
   */
  async clearAllDownloads(): Promise<void> {
    try {
      // Cancel active downloads
      for (const songId of this.activeDownloads.keys()) {
        await this.cancelDownload(songId);
      }

      // Delete all files
      if (this.downloadsDir && this.downloadsDir.exists) {
        await this.downloadsDir.delete();
        await this.downloadsDir.create();
      }

      // Clear index
      this.downloadIndex.clear();
      await this.saveDownloadIndex();

      console.log('[DownloadService] All downloads cleared');
    } catch (error) {
      console.error('[DownloadService] Error clearing downloads:', error);
      throw error;
    }
  }

  /**
   * Get total storage used by downloads
   */
  async getStorageUsed(): Promise<number> {
    let totalSize = 0;
    
    for (const download of this.downloadIndex.values()) {
      try {
        const file = new File(download.localUri);
        if (file.exists) {
          const info = await file.info();
          totalSize += info.size || 0;
        }
      } catch (error) {
        console.error('[DownloadService] Error getting file size:', error);
      }
    }

    return totalSize;
  }
}

// Export singleton instance
export const DownloadService = new DownloadServiceClass();
