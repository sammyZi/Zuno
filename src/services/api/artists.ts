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
  Artist,
  Song,
  Album,
} from '../../types/api';

/**
 * Get artists list
 * @param page - Page number (default: 1)
 * @param limit - Number of artists per page (default: 20)
 * @returns Promise with artists response
 */
export const getArtists = async (
  page: number = 1,
  limit: number = 20
): Promise<ArtistsResponse> => {
  const response = await apiClient.get<ArtistsResponse>(ENDPOINTS.GET_ARTISTS, {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Get artist by ID
 * @param id - Artist ID
 * @returns Promise with artist details
 */
export const getArtistById = async (id: string): Promise<Artist> => {
  const response = await apiClient.get<ArtistDetailsResponse>(
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
  const response = await apiClient.get<SongsResponse>(
    ENDPOINTS.GET_ARTIST_SONGS(id),
    {
      params: { page, limit },
    }
  );
  return response.data.data.results;
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
  const response = await apiClient.get<AlbumsResponse>(
    ENDPOINTS.GET_ARTIST_ALBUMS(id),
    {
      params: { page, limit },
    }
  );
  return response.data.data.results;
};
