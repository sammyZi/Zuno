/**
 * Albums API Service
 * API methods for album-related endpoints
 */

import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import type { SearchResponse, Album } from '../../types/api';

/**
 * Search albums by query
 * @param query - Search query string
 * @param page - Page number (default: 1)
 * @param limit - Number of results per page (default: 20)
 * @returns Promise with search results
 */
export const searchAlbums = async (
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<SearchResponse<Album>> => {
  const response = await apiClient.get<SearchResponse<Album>>(
    ENDPOINTS.SEARCH_ALBUMS,
    {
      params: { query, page, limit },
    }
  );
  return response.data;
};
