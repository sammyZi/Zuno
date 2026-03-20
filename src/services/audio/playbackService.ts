/**
 * Playback Service
 * Handles audio session configuration for expo-av.
 * Note: expo-av doesn't have built-in remote control events like react-native-track-player.
 * Remote controls are handled through the audio session configuration in AudioService.
 */

import { Audio } from 'expo-av';

/**
 * Initialize audio session for playback.
 * This configures the audio mode to allow background playback and proper audio routing.
 */
export async function initializePlaybackService() {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
    console.log('[PlaybackService] Audio session initialized');
  } catch (error) {
    console.error('[PlaybackService] Failed to initialize audio session:', error);
  }
}
