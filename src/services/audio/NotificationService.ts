/**
 * Notification Service
 * Manages media notifications and lock screen controls
 * Uses expo-audio's built-in media session support
 */

import { Platform } from 'react-native';
import { AudioPlayer } from 'expo-audio';
import { Song } from '../../types';
import { getImageUrl, getArtistNames } from '../../utils/audio';

class NotificationServiceClass {
  private isEnabled = false;
  private currentSong: Song | null = null;
  private playbackCallbacks: any = null;

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    try {
      this.isEnabled = true;
      console.log('[NotificationService] Initialized - using expo-audio lock screen controls');
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
    player: AudioPlayer | null
  ): Promise<void> {
    if (!this.isEnabled || !player) {
      return;
    }

    try {
      this.currentSong = song;
      
      const artworkUrl = getImageUrl(song.image);
      const artist = getArtistNames(song);

      player.setActiveForLockScreen(true, {
        title: song.name,
        artist: artist,
        albumTitle: song.album?.name || '',
        artworkUrl: artworkUrl,
      }, {
        showSeekForward: true,
        showSeekBackward: true,
      });

      console.log('[NotificationService] Media session active for:', song.name);
    } catch (error) {
      console.error('[NotificationService] Update failed:', error);
    }
  }

  /**
   * Clear notification
   */
  async clearNotification(player?: AudioPlayer | null): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    try {
      this.currentSong = null;
      if (player) {
         player.clearLockScreenControls();
      }
      console.log('[NotificationService] Media session cleared');
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
    // expo-audio automatically maps system play/pause to the player instance.
    // For next/prev, usually AudioPlaylist handles it, but we register callbacks here just in case.
    this.playbackCallbacks = callbacks;
    console.log('[NotificationService] Playback controls callbacks registered');
  }
}

export const NotificationService = new NotificationServiceClass();
