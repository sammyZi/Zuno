/**
 * Artists API Service
 * API methods for artist-related endpoints
 */

import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import type {
  ArtistsResponse,
  ArtistDetailsResponse,
  SongsResponse,
  AlbumsResponse,
  SearchResponse,
  Artist,
  Song,
  Album,
} from '../../types/api';

/**
 * Search artists by query
 * @param query - Search query string
 * @param page - Page number (default: 1)
 * @param limit - Number of results per page (default: 20)
 * @returns Promise with search results
 */
export const searchArtists = async (
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<SearchResponse<Artist>> => {
  const response = await apiClient.get<SearchResponse<Artist>>(
    ENDPOINTS.SEARCH_ARTISTS,
    {
      params: { query, page, limit },
    }
  );
  return response.data;
};

/**
 * Get artist by ID
 * Note: The /api/artists endpoint requires an artist ID or link parameter
 * @param id - Artist ID
 * @returns Promise with artist details
 */
export const getArtistById = async (id: string): Promise<Artist> => {
  const response = await apiClient.get<{ success: boolean; data: Artist }>(
    ENDPOINTS.GET_ARTIST_BY_ID(id)
  );
  return response.data.data;
};

/**
 * Get artist songs
 * @param id - Artist ID
 * @param page - Page number (default: 1)
 * @param limit - Number of songs per page (default: 20)
 * @returns Promise with artist songs
 */
export const getArtistSongs = async (
  id: string,
  page: number = 1,
  limit: number = 20
): Promise<Song[]> => {
  const response = await apiClient.get<{ success: boolean; data: { songs: Song[] } }>(
    ENDPOINTS.GET_ARTIST_SONGS(id),
    {
      params: { page, limit },
    }
  );
  return response.data.data.songs;
};

/**
 * Get artist albums
 * @param id - Artist ID
 * @param page - Page number (default: 1)
 * @param limit - Number of albums per page (default: 20)
 * @returns Promise with artist albums
 */
export const getArtistAlbums = async (
  id: string,
  page: number = 1,
  limit: number = 20
): Promise<Album[]> => {
  const response = await apiClient.get<{ success: boolean; data: { albums: Album[] } }>(
    ENDPOINTS.GET_ARTIST_ALBUMS(id),
    {
      params: { page, limit },
    }
  );
  return response.data.data.albums;
};
