/**
 * Songs API Service
 * API methods for song-related endpoints
 */

import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import type {
  SongsResponse,
  SearchResponse,
  SongDetailsResponse,
  Song,
} from '../../types/api';

/**
 * Get songs by IDs
 * Note: The /api/songs endpoint requires song IDs or a link parameter
 * For browsing songs, use searchSongs with a popular query instead
 * @param ids - Comma-separated song IDs
 * @returns Promise with songs response
 */
export const getSongs = async (ids: string): Promise<Song[]> => {
  const response = await apiClient.get<{ success: boolean; data: Song[] }>(
    ENDPOINTS.GET_SONGS,
    {
      params: { ids },
    }
  );
  return response.data.data;
};

/**
 * Search songs by query
 * @param query - Search query string
 * @param page - Page number (default: 1)
 * @param limit - Number of results per page (default: 20)
 * @returns Promise with search results
 */
export const searchSongs = async (
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<SearchResponse<Song>> => {
  const response = await apiClient.get<SearchResponse<Song>>(
    ENDPOINTS.SEARCH_SONGS,
    {
      params: { query, page, limit },
    }
  );
  return response.data;
};

/**
 * Get song by ID
 * @param id - Song ID
 * @returns Promise with song details
 */
export const getSongById = async (id: string): Promise<Song> => {
  const response = await apiClient.get<{ success: boolean; data: Song[] }>(
    ENDPOINTS.GET_SONG_BY_ID(id)
  );
  // API returns array with single song
  return response.data.data[0];
};

/**
 * Get song suggestions (workaround using search)
 * Since the suggestions API doesn't exist, we search for songs by the same artist
 * @param id - Song ID
 * @param limit - Number of suggestions (default: 10)
 * @returns Promise with suggested songs
 */
export const getSongSuggestions = async (
  id: string,
  limit: number = 10
): Promise<Song[]> => {
  try {
    // First, get the current song details to know the artist
    const currentSong = await getSongById(id);
    
    // Extract artist name (use primary artist)
    const artistName = currentSong.primaryArtists || currentSong.artists?.[0]?.name || '';
    
    if (!artistName) {
      // If no artist, return empty array
      return [];
    }
    
    // Search for songs by the same artist
    const searchResults = await searchSongs(artistName, 1, limit + 5);
    
    // Filter out the current song and return up to limit songs
    const suggestions = searchResults.data.results
      .filter(song => song.id !== id)
      .slice(0, limit);
    
    return suggestions;
  } catch (error) {
    console.warn('[getSongSuggestions] Failed to get suggestions:', error);
    return [];
  }
};
