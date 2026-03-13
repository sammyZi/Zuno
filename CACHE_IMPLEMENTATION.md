# API Caching Implementation

## Overview
Implemented Zustand-based caching to prevent unnecessary API calls when switching between pages and categories.

## What Was Changed

### 1. New Data Store (`src/store/dataStore.ts`)
- Caches API responses for songs, artists, albums, and search results
- 5-minute cache duration with automatic expiration
- Persists to AsyncStorage for offline access
- Supports pagination caching

### 2. Updated HomeScreen
- Checks cache before making API calls
- Only fetches from API if cache is empty or expired
- Caches all API responses automatically
- Works for all categories: Suggested, Songs, Artists, Albums

### 3. Updated SearchScreen
- Caches search results by query
- Returns cached results instantly for repeated searches
- Reduces API load and improves performance

## How It Works

### Cache Flow
```
User switches page/category
    ↓
Check cache (useDataStore)
    ↓
Cache hit? → Use cached data (instant)
    ↓
Cache miss? → Fetch from API → Cache response
```

### Cache Validation
- Each cached item has a timestamp
- Cache expires after 5 minutes
- Expired cache is treated as cache miss
- Pagination is tracked per category

## Benefits

1. **Faster Navigation**: Instant page switches when data is cached
2. **Reduced API Calls**: Only fetch when necessary
3. **Better UX**: No loading spinners for cached data
4. **Offline Support**: Cached data persists across app restarts
5. **Lower Bandwidth**: Fewer network requests

## Usage Example

```typescript
import { useDataStore } from './store';

// In your component
const { getSongs, setSongs } = useDataStore();

// Check cache first
const cachedSongs = getSongs(1);
if (cachedSongs) {
  // Use cached data - no API call needed
  setSongs(cachedSongs);
} else {
  // Fetch from API
  const response = await searchSongs('latest', 1, 20);
  setSongs(response.data.results);
  // Cache automatically saved
  useDataStore.getState().setSongs(response.data.results, 1);
}
```

## Cache Management

### Clear Cache
```typescript
const { clearCache, clearCategoryCache } = useDataStore();

// Clear all cache
clearCache();

// Clear specific category
clearCategoryCache('songs');
```

### Adjust Cache Duration
Edit `CACHE_DURATION` in `src/store/dataStore.ts`:
```typescript
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

## Testing

1. Navigate to Home screen
2. Switch between categories (Suggested, Songs, Artists, Albums)
3. First load: API call + loading spinner
4. Switch back: Instant load from cache
5. Wait 5 minutes: Cache expires, new API call

## Future Enhancements

- Add cache invalidation on pull-to-refresh
- Implement background cache refresh
- Add cache size limits
- Track cache hit/miss metrics
