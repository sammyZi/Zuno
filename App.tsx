import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { searchSongs } from './src/services/api';
import { getArtistNames, formatDuration } from './src/utils/audio';
import type { Song } from './src/types/api';

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use search with a popular query to get songs
        const response = await searchSongs('love', 1, 10);
        setSongs(response.data.results);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch songs');
        console.error('Error fetching songs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF8C28" />
        <Text style={styles.loadingText}>Loading songs...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Integration Test</Text>
      <Text style={styles.subtitle}>Loaded {songs.length} songs</Text>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.songItem}>
            <Text style={styles.songName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.artistName} numberOfLines={1}>
              {getArtistNames(item)}
            </Text>
            <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
          </View>
        )}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181A20',
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#FAFAFA',
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#FFFFFF',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#E22134',
    textAlign: 'center',
    padding: 20,
  },
  songItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F222A',
  },
  songName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#FAFAFA',
    marginBottom: 4,
  },
  duration: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#E3EAEC',
  },
});
