import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { usePlayerStore } from './src/store/playerStore';
import { useDownloadStore } from './src/store/downloadStore';
import { AppNavigator } from './src/navigation';

// Suppress known warnings from react-native-reanimated worklets
LogBox.ignoreLogs([
  '[Worklets] Tried to modify key `current` of an object which has been already passed to a worklet',
]);

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const initialize = usePlayerStore((state) => state.initialize);
  const initializeDownloads = useDownloadStore((state) => state.initializeDownloads);

  // Initialize audio service and downloads on app start
  useEffect(() => {
    const initializeApp = async () => {
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

      console.log('[App] App initialized');
    };

    initializeApp();
  }, [initialize, initializeDownloads]);

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
