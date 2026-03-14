/**
 * API Endpoints
 * All endpoint constants for JioSaavn API
 */

export const ENDPOINTS = {
  // Search
  SEARCH_SONGS: '/api/search/songs',
  SEARCH_ALBUMS: '/api/search/albums',
  SEARCH_ARTISTS: '/api/search/artists',

  // Songs
  GET_SONGS: '/api/songs',
  GET_SONG_BY_ID: (id: string) => `/api/songs/${id}`,
  GET_SONG_SUGGESTIONS: (id: string) => `/api/songs/${id}/suggestions`,

  // Albums
  GET_ALBUM_DETAILS: (id: string) => `/api/albums?id=${id}`,

  // Artists
  GET_ARTISTS: '/api/artists',
  GET_ARTIST_DETAILS: (id: string) => `/api/artists?id=${id}`,
  GET_ARTIST_SONGS: (id: string) => `/api/artists?id=${id}`,
  GET_ARTIST_ALBUMS: (id: string) => `/api/artists?id=${id}`,
} as const;
