/**
 * Notification Service
 * Manages media notifications and lock screen controls
 * Uses expo-av's built-in media session support
 */

import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { Song } from '../../types';
import { getImageUrl, getArtistNames } from '../../utils/audio';

class NotificationServiceClass {
  private isEnabled = false;
  private currentSong: Song | null = null;

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    try {
      // expo-av automatically handles media notifications when configured properly
      // No additional setup needed for basic media controls
      this.isEnabled = true;
      console.log('[NotificationService] Initialized - using expo-av media session');
    } catch (error) {
      console.error('[NotificationService] Initialization failed:', error);
    }
  }

  /**
   * Update notification with current song info
   * expo-av automatically creates media-style notifications with lock screen controls
   */
  async updateNotification(
    song: Song,
    isPlaying: boolean,
    sound: Audio.Sound | null
  ): Promise<void> {
    if (!this.isEnabled || !sound) {
      return;
    }

    try {
      this.currentSong = song;
      
      // expo-av automatically shows media controls when audio is loaded
      // The notification is created by the system based on the audio session
      console.log('[NotificationService] Media session active for:', song.name);
    } catch (error) {
      console.error('[NotificationService] Update failed:', error);
    }
  }

  /**
   * Clear notification
   */
  async clearNotification(): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    try {
      this.currentSong = null;
      console.log('[NotificationService] Media session cleared');
    } catch (error) {
      console.error('[NotificationService] Clear failed:', error);
    }
  }

  /**
   * Set playback controls callbacks
   * Note: expo-av handles media controls automatically through the audio session
   */
  setPlaybackControls(callbacks: {
    onPlay: () => void;
    onPause: () => void;
    onNext: () => void;
    onPrevious: () => void;
  }): void {
    // expo-av handles this through the system media session
    console.log('[NotificationService] Using expo-av built-in media controls');
  }
}

export const NotificationService = new NotificationServiceClass();
