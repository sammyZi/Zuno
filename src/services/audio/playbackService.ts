/**
 * Playback Service
 * Handles audio session configuration for expo-audio.
 */

import { setAudioModeAsync } from 'expo-audio';

/**
 * Initialize audio session for playback.
 * This configures the audio mode to allow background playback and proper audio routing.
 */
export async function initializePlaybackService() {
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });
    console.log('[PlaybackService] Audio session initialized');
  } catch (error) {
    console.error('[PlaybackService] Failed to initialize audio session:', error);
  }
}
