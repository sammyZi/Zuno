# Audio Service Documentation

## Overview

The AudioService is a singleton service that manages audio playback using expo-av. It provides a comprehensive API for loading, playing, pausing, seeking, and managing audio playback with full background playback support.

## Features

✅ **Background Playback**: Audio continues playing when app is minimized or screen is off
✅ **Audio Interruption Handling**: Properly handles phone calls and notifications
✅ **Playback State Management**: Real-time updates of playback position and status
✅ **Error Handling**: Comprehensive error handling with callbacks
✅ **High-Quality Audio**: Supports 320kbps, 160kbps, and 96kbps audio streams
✅ **Seek Support**: Precise seeking to any position in the audio
✅ **Volume Control**: Adjustable volume from 0.0 to 1.0
✅ **Playback Rate**: Support for variable playback speed

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│                    (Initialize on mount)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      PlayerStore                             │
│              (Zustand State Management)                      │
│  - Manages playback state (isPlaying, position, duration)   │
│  - Integrates with AudioService                              │
│  - Provides callbacks for UI updates                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     AudioService                             │
│                  (Singleton Instance)                        │
│  - Manages expo-av Sound instance                            │
│  - Handles audio loading and playback                        │
│  - Provides playback control methods                         │
│  - Emits status updates via callbacks                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       expo-av                                │
│              (Native Audio Playback)                         │
│  - iOS: AVPlayer                                             │
│  - Android: MediaPlayer                                      │
└─────────────────────────────────────────────────────────────┘
```

## API Reference

### Initialization

```typescript
await AudioService.initialize();
```

Initializes the audio service with background playback configuration. Must be called before using any other methods.

**Configuration:**
- `staysActiveInBackground: true` - Enables background playback
- `playsInSilentModeIOS: true` - Plays audio even when device is in silent mode
- `shouldDuckAndroid: true` - Lowers volume when other apps play audio
- `interruptionModeIOS: DoNotMix` - Stops other audio when playing
- `interruptionModeAndroid: DoNotMix` - Stops other audio when playing

### Loading Audio

```typescript
await AudioService.loadAudio(song: Song);
```

Loads audio from a song object. Automatically selects the best quality audio URL available.

**Parameters:**
- `song`: Song object containing audio URLs

**Quality Preference:**
1. 320kbps (highest quality)
2. 160kbps (medium quality)
3. 96kbps (lowest quality)

### Playback Control

#### Play Audio
```typescript
await AudioService.playAudio();
```

Starts or resumes audio playback.

#### Pause Audio
```typescript
await AudioService.pauseAudio();
```

Pauses audio playback without resetting position.

#### Stop Audio
```typescript
await AudioService.stopAudio();
```

Stops audio playback and resets position to 0.

#### Seek
```typescript
await AudioService.seekTo(positionMillis: number);
```

Seeks to a specific position in the audio.

**Parameters:**
- `positionMillis`: Position in milliseconds

### Volume and Rate Control

#### Set Volume
```typescript
await AudioService.setVolume(volume: number);
```

Sets the playback volume.

**Parameters:**
- `volume`: Volume level from 0.0 (mute) to 1.0 (max)

#### Set Playback Rate
```typescript
await AudioService.setRate(rate: number);
```

Sets the playback speed.

**Parameters:**
- `rate`: Playback rate (0.5 = half speed, 1.0 = normal, 2.0 = double speed)

### Status Queries

#### Get Position
```typescript
const position = await AudioService.getPosition();
```

Returns current playback position in milliseconds.

#### Get Duration
```typescript
const duration = await AudioService.getDuration();
```

Returns total audio duration in milliseconds.

#### Is Playing
```typescript
const playing = await AudioService.isPlaying();
```

Returns true if audio is currently playing.

#### Get Current Song
```typescript
const song = AudioService.getCurrentSong();
```

Returns the currently loaded song object.

#### Get Playback Status
```typescript
const status = AudioService.getPlaybackStatus();
```

Returns current playback status: `'idle' | 'loading' | 'playing' | 'paused' | 'stopped' | 'error'`

### Callbacks

```typescript
AudioService.setCallbacks({
  onPlaybackStatusUpdate: (status: AVPlaybackStatusSuccess) => {
    // Called every 500ms with playback status
    console.log('Position:', status.positionMillis);
    console.log('Duration:', status.durationMillis);
    console.log('Is Playing:', status.isPlaying);
  },
  
  onPlaybackEnd: () => {
    // Called when audio finishes playing
    console.log('Playback ended');
  },
  
  onError: (error: string) => {
    // Called when an error occurs
    console.error('Audio error:', error);
  },
  
  onLoading: (isLoading: boolean) => {
    // Called when loading state changes
    console.log('Loading:', isLoading);
  },
});
```

### Cleanup

```typescript
await AudioService.cleanup();
```

Unloads audio and releases all resources. Should be called when the app is closing.

## Integration with PlayerStore

The AudioService is integrated with the PlayerStore (Zustand) for state management:

```typescript
import { usePlayerStore } from '../store/playerStore';

function MyComponent() {
  const { 
    currentSong, 
    isPlaying, 
    position, 
    duration,
    play, 
    pause, 
    seekTo 
  } = usePlayerStore();

  // Play a song
  const handlePlay = async () => {
    await play(mySong);
  };

  // Pause
  const handlePause = async () => {
    await pause();
  };

  // Seek to 30 seconds
  const handleSeek = async () => {
    await seekTo(30); // in seconds
  };

  return (
    // Your UI here
  );
}
```

## Background Playback

Background playback is automatically configured when `AudioService.initialize()` is called. The audio will continue playing when:

- App is minimized
- Screen is turned off
- User switches to another app

### iOS Requirements

For iOS, you need to enable background audio in `app.json`:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["audio"]
      }
    }
  }
}
```

### Android Requirements

For Android, background playback is enabled by default with the current configuration.

## Audio Interruption Handling

The AudioService automatically handles audio interruptions:

### Phone Calls
- **Incoming Call**: Audio pauses automatically
- **Call Ends**: Audio does NOT auto-resume (user must manually resume)

### Notifications
- **Android**: Audio ducks (lowers volume) when notification plays
- **iOS**: Audio pauses when notification plays

### Other Apps
- **DoNotMix Mode**: Stops other audio when this app plays audio
- This ensures clear, uninterrupted playback

## Error Handling

All methods include comprehensive error handling:

```typescript
try {
  await AudioService.loadAudio(song);
  await AudioService.playAudio();
} catch (error) {
  console.error('Playback failed:', error);
  // Error is also sent to onError callback
}
```

Common errors:
- `"No audio URL available for this song"` - Song has no downloadUrl
- `"Failed to load audio"` - Network error or invalid URL
- `"Failed to play audio"` - Audio not loaded or device issue

## Performance Considerations

### Update Interval
- Playback status updates every 500ms
- This provides smooth progress bar updates without excessive CPU usage

### Memory Management
- Only one Sound instance is active at a time
- Previous sound is automatically unloaded when loading new audio
- Call `cleanup()` when app closes to release resources

### Network Streaming
- Audio streams directly from URL (no pre-download required)
- Buffering happens automatically
- Loading state is tracked via `isLoading` and `onLoading` callback

## Testing

Use the `AudioPlaybackExample` component for testing:

```typescript
import { AudioPlaybackExample } from './src/components/examples/AudioPlaybackExample';

// In your App.tsx or test screen
<AudioPlaybackExample />
```

This component provides:
- Play/Pause controls
- Seek forward/backward (±10s)
- Progress bar with time display
- Loading and error states
- Status information

## Troubleshooting

### Audio doesn't play
1. Check if `initialize()` was called
2. Verify song has valid `downloadUrl`
3. Check network connectivity
4. Look for errors in console

### Background playback doesn't work
1. Verify `app.json` has `UIBackgroundModes: ["audio"]` for iOS
2. Check that `initialize()` was called successfully
3. Ensure audio is playing before backgrounding app

### Position updates are slow
- Update interval is 500ms by default
- This is optimal for most use cases
- Can be adjusted in `Audio.Sound.createAsync()` options

### Audio interruptions not handled
- Interruption handling is automatic
- Check console for interruption logs
- Verify audio mode configuration in `initialize()`

## Future Enhancements

Potential improvements for future versions:

1. **Media Controls**: System media controls (lock screen, notification)
2. **Playlist Support**: Built-in playlist management
3. **Crossfade**: Smooth transitions between songs
4. **Equalizer**: Audio equalization controls
5. **Offline Caching**: Cache audio for offline playback
6. **Gapless Playback**: Seamless transitions between tracks
7. **Audio Focus**: Better audio focus management on Android

## References

- [expo-av Documentation](https://docs.expo.dev/versions/latest/sdk/audio/)
- [React Native Audio Guide](https://reactnative.dev/docs/audio)
- [iOS Background Audio](https://developer.apple.com/documentation/avfoundation/media_playback_and_selection/creating_a_basic_video_player_ios_and_tvos/enabling_background_audio)
- [Android MediaPlayer](https://developer.android.com/guide/topics/media/mediaplayer)
