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
  songName?: string;
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
  private activeDownloads: Map<string, boolean> = new Map();
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
        this.downloadsDir.create();
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

      // Create local file path - use .m4a extension since API returns MP4 audio
      const fileName = `${song.id}.m4a`;
      const file = new File(this.downloadsDir!, fileName);

      console.log('[DownloadService] Starting download:', song.name);
      console.log('[DownloadService] From URL:', audioUrl);
      console.log('[DownloadService] To file:', file.uri);

      // Store callbacks
      if (onProgress) {
        this.progressCallbacks.set(song.id, onProgress);
      }
      if (onComplete) {
        this.completionCallbacks.set(song.id, onComplete);
      }

      // Mark as downloading
      this.activeDownloads.set(song.id, true);

      // Report initial progress
      onProgress?.({
        songId: song.id,
        songName: song.name,
        progress: 0,
        totalBytes: 0,
        downloadedBytes: 0,
      });

      // Download file using the new API
      const downloadedFile = await File.downloadFileAsync(
        audioUrl,
        file,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
            'Accept': '*/*',
          },
        }
      );

      // Verify file was downloaded
      if (!downloadedFile.exists) {
        throw new Error('Downloaded file does not exist');
      }

      const fileSize = downloadedFile.size || 0;
      console.log('[DownloadService] Download complete:', song.name);
      console.log('[DownloadService] File size:', fileSize, 'bytes');

      // Report completion progress
      onProgress?.({
        songId: song.id,
        songName: song.name,
        progress: 100,
        totalBytes: fileSize,
        downloadedBytes: fileSize,
      });

      // Download successful
      const downloadedSong: DownloadedSong = {
        songId: song.id,
        localUri: downloadedFile.uri,
        downloadedAt: Date.now(),
        song,
      };

      this.downloadIndex.set(song.id, downloadedSong);
      await this.saveDownloadIndex();
      
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
    if (this.activeDownloads.has(songId)) {
      try {
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
        file.delete();
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
        this.downloadsDir.delete();
        this.downloadsDir.create();
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
          totalSize += file.size || 0;
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
