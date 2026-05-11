/**
 * Audio Service
 * Manages audio playback using expo-audio with background playback support
 */

import { 
  createAudioPlayer,
  AudioPlayer,
  setAudioModeAsync,
  AudioStatus
} from 'expo-audio';
import { Song } from '../../types';
import { getAudioUrl } from '../../utils/audio';
import { DownloadService } from '../storage';
import { NotificationService } from './NotificationService';

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'stopped' | 'error';

export interface AudioServiceCallbacks {
  onPlaybackStatusUpdate?: (status: AudioStatus) => void;
  onPlaybackEnd?: () => void;
  onError?: (error: string) => void;
  onLoading?: (isLoading: boolean) => void;
}

class AudioServiceClass {
  private player: AudioPlayer | null = null;
  private currentSong: Song | null = null;
  private callbacks: AudioServiceCallbacks = {};
  private isInitialized = false;
  private playbackStatus: PlaybackStatus = 'idle';
  private statusSubscription: any = null;

  /**
   * Initialize audio service with background playback configuration
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Retry logic for audio mode setup
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        // Wait for activity to be ready (longer delay on first attempt)
        await new Promise(resolve => setTimeout(resolve, 300 * (retryCount + 1)));
        
        // Configure audio mode for background playback using expo-audio
        await setAudioModeAsync({
          shouldPlayInBackground: true,
          playsInSilentMode: true,
          interruptionMode: 'doNotMix',
        });

        this.isInitialized = true;
        console.log('[AudioService] Initialized with background playback support (expo-audio)');
        
        // Initialize notification service
        await NotificationService.initialize();
        
        return;
      } catch (error) {
        retryCount++;
        console.warn(`[AudioService] Initialization attempt ${retryCount} failed:`, error);
        
        if (retryCount >= maxRetries) {
          console.error('[AudioService] Failed to initialize after', maxRetries, 'attempts');
          this.isInitialized = true;
          return;
        }
      }
    }
  }

  /**
   * Set callbacks for audio events
   */
  setCallbacks(callbacks: AudioServiceCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Load audio from song
   */
  async loadAudio(song: Song): Promise<void> {
    let audioUrl = '';
    try {
      this.playbackStatus = 'loading';
      this.callbacks.onLoading?.(true);

      // Unload previous sound if exists to prevent overlap
      if (this.player) {
        console.log('[AudioService] Unloading previous audio before loading new one');
        await this.unloadAudio();
      }

      // Check for local file first (offline download)
      const localUri = DownloadService.getLocalUri(song.id);
      
      if (localUri) {
        console.log('[AudioService] Using local file:', song.name);
        audioUrl = localUri;
      } else {
        // Get streaming URL
        audioUrl = getAudioUrl(song);
        if (!audioUrl) {
          throw new Error('No audio URL available for this song');
        }
        console.log('[AudioService] Streaming from URL:', song.name);
      }

      console.log('[AudioService] Loading audio:', song.name);

      // Create new player with expo-audio
      this.player = createAudioPlayer({
        uri: audioUrl,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
          'Accept': '*/*',
        }
      }, { updateInterval: 500, downloadFirst: false });

      this.statusSubscription = this.player.addListener('playbackStatusUpdate', this.onPlaybackStatusUpdate.bind(this));

      this.currentSong = song;
      this.playbackStatus = 'loading';
      this.callbacks.onLoading?.(false);

      console.log('[AudioService] Audio loaded successfully');
    } catch (error) {
      this.playbackStatus = 'error';
      this.callbacks.onLoading?.(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load audio';
      console.error('[AudioService] Load error:', errorMessage);
      console.error('[AudioService] Audio URL was:', audioUrl);
      this.callbacks.onError?.(errorMessage);
      throw error;
    }
  }

  /**
   * Play audio
   */
  async playAudio(): Promise<void> {
    if (!this.player) {
      console.warn('[AudioService] No sound loaded');
      return;
    }

    try {
      // If at the end, seek to beginning first
      if (this.player.isLoaded && this.player.currentTime >= this.player.duration - 0.5 && this.player.duration > 0) {
        await this.player.seekTo(0);
      }

      // Call play() directly — expo-audio will queue it if still loading
      this.player.play();
      this.playbackStatus = 'playing';
      console.log('[AudioService] Playback started');

      // Set up lock screen controls with metadata and seek buttons
      if (this.currentSong) {
        await NotificationService.updateNotification(this.currentSong, true, this.player);
      }
    } catch (error) {
      this.playbackStatus = 'error';
      const errorMessage = error instanceof Error ? error.message : 'Failed to play audio';
      console.error('[AudioService] Play error:', errorMessage);
      this.callbacks.onError?.(errorMessage);
    }
  }

  /**
   * Pause audio
   */
  async pauseAudio(): Promise<void> {
    if (!this.player) {
      console.warn('[AudioService] No sound loaded');
      return;
    }

    try {
      this.player.pause();
      this.playbackStatus = 'paused';
      console.log('[AudioService] Playback paused');
      
      // Update notification
      if (this.currentSong) {
        await NotificationService.updateNotification(this.currentSong, false, this.player);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to pause audio';
      console.error('[AudioService] Pause error:', errorMessage);
      this.callbacks.onError?.(errorMessage);
    }
  }

  /**
   * Seek to position in milliseconds
   */
  async seekTo(positionMillis: number): Promise<void> {
    if (!this.player) {
      console.warn('[AudioService] No sound loaded');
      return;
    }

    try {
      await this.player.seekTo(positionMillis / 1000);
      console.log('[AudioService] Seeked to:', positionMillis);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to seek';
      console.error('[AudioService] Seek error:', errorMessage);
      this.callbacks.onError?.(errorMessage);
    }
  }

  /**
   * Stop audio and reset position
   */
  async stopAudio(): Promise<void> {
    if (!this.player) {
      return;
    }

    try {
      this.player.pause();
      await this.player.seekTo(0);
      this.playbackStatus = 'stopped';
      console.log('[AudioService] Playback stopped');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to stop audio';
      console.error('[AudioService] Stop error:', errorMessage);
    }
  }

  /**
   * Unload current audio
   */
  async unloadAudio(): Promise<void> {
    if (!this.player) {
      return;
    }

    try {
      console.log('[AudioService] Unloading audio:', this.currentSong?.name);
      
      this.player.pause();
      if (this.statusSubscription) {
        this.statusSubscription.remove();
        this.statusSubscription = null;
      }
      this.player.clearLockScreenControls();
      this.player.remove();
      this.player = null;
      this.currentSong = null;
      this.playbackStatus = 'idle';
      console.log('[AudioService] Audio unloaded successfully');
    } catch (error) {
      console.error('[AudioService] Unload error:', error);
      // Force cleanup even on error
      this.player = null;
      this.currentSong = null;
      this.playbackStatus = 'idle';
    }
  }

  /**
   * Get current playback position in milliseconds
   */
  async getPosition(): Promise<number> {
    if (!this.player) {
      return 0;
    }
    return this.player.currentTime * 1000;
  }

  /**
   * Get current playback duration in milliseconds
   */
  async getDuration(): Promise<number> {
    if (!this.player) {
      return 0;
    }
    return this.player.duration * 1000;
  }

  /**
   * Get current song
   */
  getCurrentSong(): Song | null {
    return this.currentSong;
  }

  /**
   * Get current playback status
   */
  getPlaybackStatus(): PlaybackStatus {
    return this.playbackStatus;
  }

  /**
   * Check if audio is playing
   */
  async isPlaying(): Promise<boolean> {
    if (!this.player) {
      return false;
    }
    return this.player.playing;
  }

  /**
   * Set playback rate (speed)
   */
  async setRate(rate: number): Promise<void> {
    if (!this.player) {
      return;
    }
    try {
      this.player.setPlaybackRate(rate, 'high');
      console.log('[AudioService] Playback rate set to:', rate);
    } catch (error) {
      console.error('[AudioService] Set rate error:', error);
    }
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  async setVolume(volume: number): Promise<void> {
    if (!this.player) {
      return;
    }
    try {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      this.player.volume = clampedVolume;
      console.log('[AudioService] Volume set to:', clampedVolume);
    } catch (error) {
      console.error('[AudioService] Set volume error:', error);
    }
  }

  /**
   * Handle playback status updates
   */
  private onPlaybackStatusUpdate(status: AudioStatus): void {
    // Note: status.error is not natively in all versions, wait, let's catch standard ones
    if (!status.isLoaded && !status.isBuffering) {
      // In expo-audio, error might be available on status
      if ((status as any).error) {
        console.error('[AudioService] Playback error:', (status as any).error);
        this.playbackStatus = 'error';
        this.callbacks.onError?.((status as any).error);
      }
      // return; // wait, let's not return early if not loaded, let state update
    }

    // Update playback status
    if (status.playing) {
      this.playbackStatus = 'playing';
    } else if (status.isBuffering) {
      this.playbackStatus = 'loading';
    } else {
      this.playbackStatus = 'paused';
    }

    // Call status update callback
    this.callbacks.onPlaybackStatusUpdate?.(status);

    // Handle playback end
    if (status.didJustFinish && !status.loop) {
      console.log('[AudioService] Playback finished');
      this.playbackStatus = 'stopped';
      this.callbacks.onPlaybackEnd?.();
    }
  }

  /**
   * Cleanup and release resources
   */
  async cleanup(): Promise<void> {
    await this.unloadAudio();
    this.callbacks = {};
    this.isInitialized = false;
    console.log('[AudioService] Cleaned up');
  }
}

// Export singleton instance
export const AudioService = new AudioServiceClass();
