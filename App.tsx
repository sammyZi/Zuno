import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { usePlayerStore } from './src/store/playerStore';
import { useDownloadStore } from './src/store/downloadStore';
import { useQueueStore } from './src/store/queueStore';
import { AppNavigator } from './src/navigation';

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const initialize = usePlayerStore((state) => state.initialize);
  const initializeDownloads = useDownloadStore((state) => state.initializeDownloads);
  const clearQueue = useQueueStore((state) => state.clearQueue);
  const appState = useRef(AppState.currentState);

  // Clear queue when app goes to background or is closed
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (
        appState.current.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        // App is going to background or being closed
        console.log('[App] App going to background, clearing queue');
        clearQueue();
        try {
          await AsyncStorage.removeItem('queue-storage');
        } catch (error) {
          console.warn('[App] Failed to clear queue storage on background:', error);
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [clearQueue]);

  // Initialize audio service, downloads, and clear queue on app start
  useEffect(() => {
    const initializeApp = async () => {
      // Clear persisted queue storage first
      try {
        await AsyncStorage.removeItem('queue-storage');
        console.log('[App] Cleared persisted queue storage');
      } catch (error) {
        console.warn('[App] Failed to clear queue storage:', error);
      }

      // Longer delay to ensure activity is fully ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        await initialize();
      } catch (err) {
        console.warn('[App] Audio initialization failed:', err);
      }
      
      try {
        await initializeDownloads();
      } catch (err) {
        console.warn('[App] Download initialization failed:', err);
      }

      // Clear queue in memory
      clearQueue();
      console.log('[App] Queue cleared on app start');
    };

    initializeApp();
  }, [initialize, initializeDownloads, clearQueue]);

  if (!fontsLoaded) {
    return null; // Or a loading screen
  }

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}
