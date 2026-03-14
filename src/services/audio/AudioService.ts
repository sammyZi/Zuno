/**
 * Audio Service
 * Manages audio playback using expo-av with background playback support
 */

import { 
  Audio, 
  AVPlaybackStatus, 
  AVPlaybackStatusSuccess,
  InterruptionModeIOS,
  InterruptionModeAndroid 
} from 'expo-av';
import { Song } from '../../types';
import { getAudioUrl } from '../../utils/audio';
import { DownloadService } from '../storage';

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'stopped' | 'error';

export interface AudioServiceCallbacks {
  onPlaybackStatusUpdate?: (status: AVPlaybackStatusSuccess) => void;
  onPlaybackEnd?: () => void;
  onError?: (error: string) => void;
  onLoading?: (isLoading: boolean) => void;
}

class AudioServiceClass {
  private sound: Audio.Sound | null = null;
  private currentSong: Song | null = null;
  private callbacks: AudioServiceCallbacks = {};
  private isInitialized = false;
  private playbackStatus: PlaybackStatus = 'idle';

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
        // Wait for activity to be ready
        await new Promise(resolve => setTimeout(resolve, 200 * (retryCount + 1)));
        
        // Configure audio mode for background playback
        await Audio.setAudioModeAsync({
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        });

        this.isInitialized = true;
        console.log('[AudioService] Initialized with background playback support');
        return;
      } catch (error) {
        retryCount++;
        console.warn(`[AudioService] Initialization attempt ${retryCount} failed:`, error);
        
        if (retryCount >= maxRetries) {
          console.error('[AudioService] Failed to initialize after', maxRetries, 'attempts');
          // Mark as initialized anyway - app can work without keep-awake
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

      // Unload previous sound if exists
      if (this.sound) {
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
      console.log('[AudioService] Audio URL:', audioUrl);

      // Create and load new sound with proper headers
      const { sound } = await Audio.Sound.createAsync(
        { 
          uri: audioUrl,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
            'Accept': '*/*',
          }
        },
        { shouldPlay: false, progressUpdateIntervalMillis: 500 },
        this.onPlaybackStatusUpdate.bind(this)
      );

      this.sound = sound;
      this.currentSong = song;
      this.playbackStatus = 'stopped';
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
    if (!this.sound) {
      console.warn('[AudioService] No sound loaded');
      return;
    }

    try {
      const status = await this.sound.getStatusAsync();
      
      if (status.isLoaded) {
        // If at the end, replay from beginning
        if (status.didJustFinish) {
          await this.sound.setPositionAsync(0);
        }
        
        await this.sound.playAsync();
        this.playbackStatus = 'playing';
        console.log('[AudioService] Playback started');
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
    if (!this.sound) {
      console.warn('[AudioService] No sound loaded');
      return;
    }

    try {
      await this.sound.pauseAsync();
      this.playbackStatus = 'paused';
      console.log('[AudioService] Playback paused');
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
    if (!this.sound) {
      console.warn('[AudioService] No sound loaded');
      return;
    }

    try {
      await this.sound.setPositionAsync(positionMillis);
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
    if (!this.sound) {
      return;
    }

    try {
      await this.sound.stopAsync();
      await this.sound.setPositionAsync(0);
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
    if (!this.sound) {
      return;
    }

    try {
      await this.sound.unloadAsync();
      this.sound = null;
      this.currentSong = null;
      this.playbackStatus = 'idle';
      console.log('[AudioService] Audio unloaded');
    } catch (error) {
      console.error('[AudioService] Unload error:', error);
    }
  }

  /**
   * Get current playback position in milliseconds
   */
  async getPosition(): Promise<number> {
    if (!this.sound) {
      return 0;
    }

    try {
      const status = await this.sound.getStatusAsync();
      if (status.isLoaded) {
        return status.positionMillis;
      }
    } catch (error) {
      console.error('[AudioService] Get position error:', error);
    }

    return 0;
  }

  /**
   * Get current playback duration in milliseconds
   */
  async getDuration(): Promise<number> {
    if (!this.sound) {
      return 0;
    }

    try {
      const status = await this.sound.getStatusAsync();
      if (status.isLoaded && status.durationMillis) {
        return status.durationMillis;
      }
    } catch (error) {
      console.error('[AudioService] Get duration error:', error);
    }

    return 0;
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
    if (!this.sound) {
      return false;
    }

    try {
      const status = await this.sound.getStatusAsync();
      return status.isLoaded && status.isPlaying;
    } catch (error) {
      console.error('[AudioService] Is playing check error:', error);
      return false;
    }
  }

  /**
   * Set playback rate (speed)
   */
  async setRate(rate: number): Promise<void> {
    if (!this.sound) {
      return;
    }

    try {
      await this.sound.setRateAsync(rate, true);
      console.log('[AudioService] Playback rate set to:', rate);
    } catch (error) {
      console.error('[AudioService] Set rate error:', error);
    }
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  async setVolume(volume: number): Promise<void> {
    if (!this.sound) {
      return;
    }

    try {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      await this.sound.setVolumeAsync(clampedVolume);
      console.log('[AudioService] Volume set to:', clampedVolume);
    } catch (error) {
      console.error('[AudioService] Set volume error:', error);
    }
  }

  /**
   * Handle playback status updates
   */
  private onPlaybackStatusUpdate(status: AVPlaybackStatus): void {
    if (!status.isLoaded) {
      if (status.error) {
        console.error('[AudioService] Playback error:', status.error);
        this.playbackStatus = 'error';
        this.callbacks.onError?.(status.error);
      }
      return;
    }

    // Update playback status
    if (status.isPlaying) {
      this.playbackStatus = 'playing';
    } else if (status.isBuffering) {
      this.playbackStatus = 'loading';
    } else {
      this.playbackStatus = 'paused';
    }

    // Call status update callback
    this.callbacks.onPlaybackStatusUpdate?.(status);

    // Handle playback end
    if (status.didJustFinish && !status.isLooping) {
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
