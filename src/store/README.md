# Zustand Stores - Quick Start Guide

## Import Stores

```typescript
import { usePlayerStore, useQueueStore, useSearchStore } from './store';
```

## Player Store

### Get State
```typescript
const { currentSong, isPlaying, position, duration } = usePlayerStore();
```

### Actions
```typescript
const { play, pause, togglePlayPause, setPosition, setCurrentSong } = usePlayerStore();

// Play a song
play(song);

// Toggle playback
togglePlayPause();

// Update position (from audio service)
setPosition(30); // 30 seconds
```

## Queue Store

### Get State
```typescript
const { queue, currentIndex, shuffle, repeat } = useQueueStore();
```

### Actions
```typescript
const { addToQueue, nextSong, previousSong, toggleShuffle, setRepeat } = useQueueStore();

// Add songs to queue
addToQueue(song);
addToQueue([song1, song2, song3]);

// Navigate queue
const next = nextSong(); // Returns next song or null
const prev = previousSong(); // Returns previous song or null

// Toggle shuffle
toggleShuffle();

// Set repeat mode
setRepeat('off'); // 'off' | 'all' | 'one'
```

## Search Store

### Get State
```typescript
const { searchQuery, searchResults, isSearching } = useSearchStore();
```

### Actions
```typescript
const { setSearchQuery, setSearchResults, setIsSearching, clearSearch } = useSearchStore();

// Perform search
const handleSearch = async (query: string) => {
  setSearchQuery(query);
  setIsSearching(true);
  const results = await searchAPI(query);
  setSearchResults(results); // Also sets isSearching to false
};

// Clear search
clearSearch();
```

## Custom Hook (usePlayback)

Combines player and queue stores for common operations:

```typescript
import { usePlayback } from '../hooks';

const {
  currentSong,
  isPlaying,
  playSong,
  playNext,
  playPrevious,
  playQueue,
} = usePlayback();

// Play a single song
playSong(song);

// Play a song and replace queue
playSong(song, true);

// Play next/previous
playNext();
playPrevious();

// Play a list of songs
playQueue([song1, song2, song3], 0); // Start at index 0
```

## Persistence

The queue store automatically persists to AsyncStorage:
- Queue array
- Current index
- Shuffle mode
- Repeat mode

Data is restored automatically when the app launches.

## Performance Tips

### Selective Subscriptions
Only subscribe to the state you need:

```typescript
// Good - only re-renders when isPlaying changes
const isPlaying = usePlayerStore(state => state.isPlaying);

// Less optimal - re-renders on any player state change
const { isPlaying } = usePlayerStore();
```

### Outside React Components
Access stores outside React components:

```typescript
import { usePlayerStore } from './store';

// Get current state
const state = usePlayerStore.getState();
console.log(state.isPlaying);

// Call actions
usePlayerStore.getState().play(song);
```

## Common Patterns

### Play Song from List
```typescript
const handleSongPress = (song: Song, allSongs: Song[], index: number) => {
  const { playQueue } = usePlayback();
  playQueue(allSongs, index);
};
```

### Mini Player
```typescript
function MiniPlayer() {
  const { currentSong, isPlaying } = usePlayerStore();
  const { togglePlayPause } = usePlayback();
  
  if (!currentSong) return null;
  
  return (
    <View>
      <Text>{currentSong.name}</Text>
      <Button onPress={togglePlayPause}>
        {isPlaying ? 'Pause' : 'Play'}
      </Button>
    </View>
  );
}
```

### Queue Screen
```typescript
function QueueScreen() {
  const { queue, currentIndex } = useQueueStore();
  const { removeFromQueue, reorderQueue } = useQueueStore();
  
  return (
    <FlatList
      data={queue}
      renderItem={({ item, index }) => (
        <QueueItem
          song={item}
          isPlaying={index === currentIndex}
          onRemove={() => removeFromQueue(index)}
        />
      )}
    />
  );
}
```

### Search Screen
```typescript
function SearchScreen() {
  const { searchQuery, searchResults, isSearching } = useSearchStore();
  const { setSearchQuery, setSearchResults, setIsSearching } = useSearchStore();
  
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    try {
      const results = await searchSongs(query);
      setSearchResults(results);
    } catch (error) {
      setIsSearching(false);
    }
  };
  
  return (
    <View>
      <SearchBar value={searchQuery} onChangeText={handleSearch} />
      {isSearching && <Loader />}
      <FlatList data={searchResults} renderItem={renderSong} />
    </View>
  );
}
```

## Integration with Audio Service

```typescript
import { Audio } from 'expo-av';
import { usePlayerStore } from './store';

class AudioService {
  private sound: Audio.Sound | null = null;
  
  async loadAndPlay(song: Song) {
    // Load audio
    const { sound } = await Audio.Sound.createAsync(
      { uri: getAudioUrl(song) },
      { shouldPlay: true }
    );
    
    this.sound = sound;
    
    // Update duration
    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      usePlayerStore.getState().setDuration(status.durationMillis / 1000);
    }
    
    // Listen to position updates
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        usePlayerStore.getState().setPosition(status.positionMillis / 1000);
      }
    });
  }
  
  async play() {
    await this.sound?.playAsync();
    usePlayerStore.getState().play();
  }
  
  async pause() {
    await this.sound?.pauseAsync();
    usePlayerStore.getState().pause();
  }
}
```

## Testing

See `__tests__/storeVerification.tsx` for a complete testing component.

## Documentation

For detailed documentation, see `STORE_IMPLEMENTATION.md`.
