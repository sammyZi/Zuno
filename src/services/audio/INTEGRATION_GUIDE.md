# AudioService Integration Guide

## Quick Start

This guide shows you how to integrate the AudioService into your React Native components.

## Basic Usage

### 1. Using the PlayerStore Hook

The easiest way to use audio playback is through the `usePlayerStore` hook:

```typescript
import { usePlayerStore } from '../store/playerStore';

function MyPlayerComponent() {
  const {
    currentSong,
    isPlaying,
    isLoading,
    position,
    duration,
    error,
    play,
    pause,
    togglePlayPause,
    seekTo,
  } = usePlayerStore();

  const handlePlaySong = async (song: Song) => {
    await play(song);
  };

  return (
    <View>
      <Text>{currentSong?.name || 'No song playing'}</Text>
      <Text>{formatDuration(position)} / {formatDuration(duration)}</Text>
      
      <Button 
        title={isPlaying ? 'Pause' : 'Play'} 
        onPress={togglePlayPause}
        disabled={isLoading}
      />
      
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}
```

### 2. Using the Playback Hook

For more advanced features including queue management:

```typescript
import { usePlayback } from '../hooks/usePlayback';

function MyPlayerComponent() {
  const {
    currentSong,
    isPlaying,
    position,
    duration,
    playSong,
    playNext,
    playPrevious,
    togglePlayPause,
    seekTo,
  } = usePlayback();

  return (
    <View>
      <Button title="Previous" onPress={playPrevious} />
      <Button title={isPlaying ? 'Pause' : 'Play'} onPress={togglePlayPause} />
      <Button title="Next" onPress={playNext} />
    </View>
  );
}
```

## Common Patterns

### Playing a Song

```typescript
// Simple play
await play(song);

// Play with queue replacement
playSong(song, true);

// Play a list of songs
playQueue(songs, 0); // Start at index 0
```

### Seeking

```typescript
// Seek to 30 seconds
await seekTo(30);

// Seek to percentage
const targetPosition = (duration * percentage) / 100;
await seekTo(targetPosition);

// Seek forward 10 seconds
await seekTo(position + 10);

// Seek backward 10 seconds
await seekTo(Math.max(0, position - 10));
```

### Progress Bar

```typescript
import Slider from '@react-native-community/slider';

function ProgressBar() {
  const { position, duration, seekTo } = usePlayerStore();
  const [seeking, setSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);

  const handleSeekStart = () => {
    setSeeking(true);
  };

  const handleSeekChange = (value: number) => {
    setSeekPosition(value);
  };

  const handleSeekComplete = async (value: number) => {
    await seekTo(value);
    setSeeking(false);
  };

  const displayPosition = seeking ? seekPosition : position;

  return (
    <View>
      <Slider
        value={displayPosition}
        minimumValue={0}
        maximumValue={duration}
        onSlidingStart={handleSeekStart}
        onValueChange={handleSeekChange}
        onSlidingComplete={handleSeekComplete}
      />
      <View style={styles.timeContainer}>
        <Text>{formatDuration(displayPosition)}</Text>
        <Text>{formatDuration(duration)}</Text>
      </View>
    </View>
  );
}
```

### Loading States

```typescript
function PlayerControls() {
  const { isPlaying, isLoading, togglePlayPause } = usePlayerStore();

  return (
    <TouchableOpacity 
      onPress={togglePlayPause}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="large" color="#FF8C28" />
      ) : (
        <Icon name={isPlaying ? 'pause' : 'play'} size={32} />
      )}
    </TouchableOpacity>
  );
}
```

### Error Handling

```typescript
function PlayerWithError() {
  const { error, play } = usePlayerStore();

  const handlePlay = async (song: Song) => {
    try {
      await play(song);
    } catch (err) {
      // Error is automatically set in store
      console.error('Failed to play:', err);
    }
  };

  return (
    <View>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Dismiss" onPress={() => setError(null)} />
        </View>
      )}
      {/* Rest of your UI */}
    </View>
  );
}
```

## Advanced Usage

### Direct AudioService Access

For advanced use cases, you can access AudioService directly:

```typescript
import { AudioService } from '../services/audio';

// Set custom callbacks
AudioService.setCallbacks({
  onPlaybackStatusUpdate: (status) => {
    console.log('Position:', status.positionMillis);
  },
  onPlaybackEnd: () => {
    console.log('Track ended');
    // Play next track
  },
});

// Control volume
await AudioService.setVolume(0.5); // 50% volume

// Control playback rate
await AudioService.setRate(1.5); // 1.5x speed

// Get raw status
const status = AudioService.getPlaybackStatus();
```

### Custom Playback Logic

```typescript
function CustomPlayer() {
  const { currentSong, play, pause } = usePlayerStore();

  useEffect(() => {
    // Set up custom callbacks
    AudioService.setCallbacks({
      onPlaybackEnd: async () => {
        // Custom logic when track ends
        const nextSong = await fetchNextSong();
        if (nextSong) {
          await play(nextSong);
        }
      },
      onError: (error) => {
        // Custom error handling
        showNotification('Playback error: ' + error);
      },
    });
  }, []);

  // Your component logic
}
```

### Background Playback Monitoring

```typescript
import { AppState } from 'react-native';

function BackgroundAwarePlayer() {
  const { isPlaying } = usePlayerStore();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background') {
        console.log('App backgrounded, audio should continue');
        // Audio continues automatically
      } else if (nextAppState === 'active') {
        console.log('App foregrounded');
        // State is automatically synced
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <View>
      <Text>Playing in background: {isPlaying ? 'Yes' : 'No'}</Text>
    </View>
  );
}
```

## Mini Player Example

```typescript
function MiniPlayer() {
  const { currentSong, isPlaying, togglePlayPause } = usePlayerStore();
  const navigation = useNavigation();

  if (!currentSong) return null;

  return (
    <TouchableOpacity 
      style={styles.miniPlayer}
      onPress={() => navigation.navigate('Player')}
    >
      <Image 
        source={{ uri: getImageUrl(currentSong.image) }} 
        style={styles.albumArt}
      />
      <View style={styles.songInfo}>
        <Text style={styles.songName}>{currentSong.name}</Text>
        <Text style={styles.artistName}>
          {getArtistNames(currentSong)}
        </Text>
      </View>
      <TouchableOpacity onPress={togglePlayPause}>
        <Icon name={isPlaying ? 'pause' : 'play'} size={24} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
```

## Full Player Screen Example

```typescript
function PlayerScreen() {
  const {
    currentSong,
    isPlaying,
    isLoading,
    position,
    duration,
    togglePlayPause,
    seekTo,
  } = usePlayerStore();

  const { playNext, playPrevious } = usePlayback();

  if (!currentSong) {
    return <Text>No song playing</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Album Art */}
      <Image 
        source={{ uri: getImageUrl(currentSong.image, '500x500') }}
        style={styles.albumArt}
      />

      {/* Song Info */}
      <Text style={styles.songName}>{currentSong.name}</Text>
      <Text style={styles.artistName}>
        {getArtistNames(currentSong)}
      </Text>

      {/* Progress Bar */}
      <ProgressBar />

      {/* Main Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={playPrevious}>
          <Icon name="skip-previous" size={32} />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={togglePlayPause}
          disabled={isLoading}
          style={styles.playButton}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="#FFF" />
          ) : (
            <Icon 
              name={isPlaying ? 'pause' : 'play'} 
              size={48} 
              color="#FFF"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={playNext}>
          <Icon name="skip-next" size={32} />
        </TouchableOpacity>
      </View>

      {/* Secondary Controls */}
      <View style={styles.secondaryControls}>
        <TouchableOpacity>
          <Icon name="shuffle" size={24} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="repeat" size={24} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="queue-music" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

## Initialization

The AudioService is automatically initialized in `App.tsx`:

```typescript
// App.tsx
import { usePlayerStore } from './src/store/playerStore';

export default function App() {
  const initialize = usePlayerStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Rest of your app
}
```

You don't need to initialize it again in your components.

## Best Practices

### 1. Use Hooks, Not Direct Store Access

❌ **Don't:**
```typescript
import { usePlayerStore } from '../store/playerStore';

const store = usePlayerStore.getState();
store.play(song); // Direct access
```

✅ **Do:**
```typescript
const { play } = usePlayerStore();
await play(song); // Use hook
```

### 2. Handle Async Operations

❌ **Don't:**
```typescript
<Button onPress={play(song)} /> // Wrong!
```

✅ **Do:**
```typescript
<Button onPress={() => play(song)} /> // Correct
// or
<Button onPress={handlePlay} />
```

### 3. Check for Current Song

❌ **Don't:**
```typescript
<Text>{currentSong.name}</Text> // May crash if null
```

✅ **Do:**
```typescript
<Text>{currentSong?.name || 'No song'}</Text>
// or
{currentSong && <Text>{currentSong.name}</Text>}
```

### 4. Disable Controls When Loading

❌ **Don't:**
```typescript
<Button onPress={togglePlayPause} />
```

✅ **Do:**
```typescript
<Button 
  onPress={togglePlayPause} 
  disabled={isLoading}
/>
```

### 5. Show Error Messages

❌ **Don't:**
```typescript
// Ignore errors
```

✅ **Do:**
```typescript
{error && (
  <View style={styles.error}>
    <Text>{error}</Text>
  </View>
)}
```

## TypeScript Types

```typescript
import { Song } from '../types';
import { PlaybackStatus, AudioServiceCallbacks } from '../services/audio';

// Song type is already defined in types/api.ts
const song: Song = {
  id: '1',
  name: 'Song Name',
  // ... other properties
};

// Playback status
const status: PlaybackStatus = 'playing';
// 'idle' | 'loading' | 'playing' | 'paused' | 'stopped' | 'error'

// Callbacks
const callbacks: AudioServiceCallbacks = {
  onPlaybackStatusUpdate: (status) => {},
  onPlaybackEnd: () => {},
  onError: (error) => {},
  onLoading: (isLoading) => {},
};
```

## Troubleshooting

### Audio doesn't play
- Check if song has valid `downloadUrl`
- Verify network connectivity
- Check console for errors
- Ensure `initialize()` was called

### State not updating
- Make sure you're using the hook, not direct store access
- Check if component is subscribed to store
- Verify callbacks are set up correctly

### Background playback doesn't work
- Check `app.json` has `UIBackgroundModes: ["audio"]`
- Verify audio is playing before backgrounding
- Test on real device (may not work in simulator)

## Performance Tips

1. **Memoize callbacks:**
```typescript
const handlePlay = useCallback(async () => {
  await play(song);
}, [play, song]);
```

2. **Avoid unnecessary re-renders:**
```typescript
// Only subscribe to what you need
const isPlaying = usePlayerStore((state) => state.isPlaying);
```

3. **Debounce seek operations:**
```typescript
const debouncedSeek = useMemo(
  () => debounce((pos) => seekTo(pos), 300),
  [seekTo]
);
```

## Next Steps

- Implement queue management
- Add shuffle and repeat modes
- Implement media controls (lock screen)
- Add offline playback support

## Support

For issues or questions:
1. Check the [AudioService README](./README.md)
2. Review the [example component](../../components/examples/AudioPlaybackExample.tsx)
3. Check the [implementation summary](../../../AUDIO_PLAYBACK_IMPLEMENTATION.md)
