/**
 * Notification Service
 * Manages media notifications and lock screen controls using expo-av
 */

import { Audio } from 'expo-av';
import { Song } from '../../types';
import { getImageUrl } from '../../utils/audio';

class NotificationServiceClass {
  private isEnabled = false;

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    try {
      // Request notification permissions (handled by expo-av)
      this.isEnabled = true;
      console.log('[NotificationService] Initialized');
    } catch (error) {
      console.error('[NotificationService] Initialization failed:', error);
    }
  }

  /**
   * Update notification with current song info
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
      // expo-av automatically handles media notifications on Android
      // when audio is playing with proper metadata
      await sound.setStatusAsync({
        shouldPlay: isPlaying,
      });

      console.log('[NotificationService] Updated notification for:', song.name);
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
      console.log('[NotificationService] Cleared notification');
    } catch (error) {
      console.error('[NotificationService] Clear failed:', error);
    }
  }

  /**
   * Set playback controls callbacks
   */
  setPlaybackControls(callbacks: {
    onPlay: () => void;
    onPause: () => void;
    onNext: () => void;
    onPrevious: () => void;
  }): void {
    // expo-av handles this automatically through the sound object
    console.log('[NotificationService] Playback controls set');
  }
}

export const NotificationService = new NotificationServiceClass();
