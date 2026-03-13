import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { usePlayerStore } from './src/store/playerStore';
import { AppNavigator } from './src/navigation';

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const initialize = usePlayerStore((state) => state.initialize);

  // Initialize audio service on app start
  useEffect(() => {
    // Delay initialization to ensure activity is ready
    const timer = setTimeout(() => {
      initialize().catch(err => {
        console.warn('[App] Audio initialization failed:', err);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [initialize]);

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
