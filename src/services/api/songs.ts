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
 * Get song suggestions
 * @param id - Song ID
 * @param limit - Number of suggestions (default: 10)
 * @returns Promise with suggested songs
 */
export const getSongSuggestions = async (
  id: string,
  limit: number = 10
): Promise<Song[]> => {
  const response = await apiClient.get<{ success: boolean; data: Song[] }>(
    ENDPOINTS.GET_SONG_SUGGESTIONS(id),
    {
      params: { limit },
    }
  );
  return response.data.data;
};
