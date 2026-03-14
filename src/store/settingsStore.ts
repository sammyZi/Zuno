/**
 * Settings Store
 * Manages app settings with AsyncStorage persistence
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_STORAGE_KEY = '@settings';

export type ThemeMode = 'dark' | 'light';
export type AudioQuality = '96kbps' | '160kbps' | '320kbps';
export type DownloadPreference = 'wifi-only' | 'mobile-allowed';

export interface SettingsState {
  // Theme
  theme: ThemeMode;
  
  // Audio
  audioQuality: AudioQuality;
  
  // Download
  downloadPreference: DownloadPreference;
  
  // Storage
  storageUsed: number; // in bytes
  
  // Actions
  setTheme: (theme: ThemeMode) => Promise<void>;
  setAudioQuality: (quality: AudioQuality) => Promise<void>;
  setDownloadPreference: (preference: DownloadPreference) => Promise<void>;
  updateStorageUsed: (bytes: number) => void;
  clearCache: () => Promise<void>;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  // Default values
  theme: 'dark',
  audioQuality: '320kbps',
  downloadPreference: 'wifi-only',
  storageUsed: 0,

  // Set theme
  setTheme: async (theme: ThemeMode) => {
    set({ theme });
    await get().saveSettings();
  },

  // Set audio quality
  setAudioQuality: async (quality: AudioQuality) => {
    set({ audioQuality: quality });
    await get().saveSettings();
  },

  // Set download preference
  setDownloadPreference: async (preference: DownloadPreference) => {
    set({ downloadPreference: preference });
    await get().saveSettings();
  },

  // Update storage used
  updateStorageUsed: (bytes: number) => {
    set({ storageUsed: bytes });
  },

  // Clear cache
  clearCache: async () => {
    // This will be implemented to clear downloaded songs
    set({ storageUsed: 0 });
    await get().saveSettings();
  },

  // Load settings from AsyncStorage
  loadSettings: async () => {
    try {
      const settingsJson = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        set({
          theme: settings.theme || 'dark',
          audioQuality: settings.audioQuality || '320kbps',
          downloadPreference: settings.downloadPreference || 'wifi-only',
          storageUsed: settings.storageUsed || 0,
        });
        console.log('[SettingsStore] Settings loaded');
      }
    } catch (error) {
      console.error('[SettingsStore] Error loading settings:', error);
    }
  },

  // Save settings to AsyncStorage
  saveSettings: async () => {
    try {
      const state = get();
      const settings = {
        theme: state.theme,
        audioQuality: state.audioQuality,
        downloadPreference: state.downloadPreference,
        storageUsed: state.storageUsed,
      };
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      console.log('[SettingsStore] Settings saved');
    } catch (error) {
      console.error('[SettingsStore] Error saving settings:', error);
    }
  },
}));
