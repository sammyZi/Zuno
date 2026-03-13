/**
 * API Type Definitions
 * TypeScript interfaces for JioSaavn API responses
 */

export interface Song {
  id: string;
  name: string;
  duration: number;
  language: string;
  album: {
    id: string;
    name: string;
    url?: string;
  };
  artists: {
    primary: Array<{
      id: string;
      name: string;
      role?: string;
      image?: Array<{
        quality: string;
        url: string;
      }>;
      type?: string;
      url?: string;
    }>;
    featured?: Array<{
      id: string;
      name: string;
      role?: string;
    }>;
    all?: Array<{
      id: string;
      name: string;
      role?: string;
    }>;
  };
  image: Array<{
    quality: string;
    url: string;
  }>;
  downloadUrl: Array<{
    quality: string;
    url: string;
  }>;
  year?: string;
  playCount?: string;
  primaryArtists?: string;
  releaseDate?: string;
  label?: string;
  copyright?: string;
  hasLyrics?: boolean;
  lyricsSnippet?: string;
  url?: string;
}

export interface Artist {
  id: string;
  name: string;
  image: Array<{
    quality: string;
    url: string;
  }>;
  followerCount?: string;
  type?: string;
  isVerified?: boolean;
  dominantLanguage?: string;
  dominantType?: string;
  bio?: string;
  dob?: string;
  fb?: string;
  twitter?: string;
  wiki?: string;
  availableLanguages?: string[];
  isRadioPresent?: boolean;
  url?: string;
}

export interface Album {
  id: string;
  name: string;
  year?: string;
  releaseDate?: string;
  songCount?: number;
  url?: string;
  primaryArtists?: string;
  primaryArtistsId?: string;
  image: Array<{
    quality: string;
    url: string;
  }>;
  songs?: Song[];
  artists?: {
    primary?: Array<{
      id: string;
      name: string;
      role?: string;
      image?: Array<{
        quality: string;
        url: string;
      }>;
    }>;
    featured?: Array<{
      id: string;
      name: string;
      role?: string;
    }>;
    all?: Array<{
      id: string;
      name: string;
      role?: string;
    }>;
  };
  language?: string;
  type?: string;
}

export interface SearchResponse<T = Song> {
  status: string;
  message?: string;
  data: {
    total: number;
    start: number;
    results: T[];
  };
}

export interface SongsResponse {
  status: string;
  message?: string;
  data: {
    total: number;
    start: number;
    results: Song[];
  };
}

export interface ArtistsResponse {
  status: string;
  message?: string;
  data: {
    total: number;
    start: number;
    results: Artist[];
  };
}

export interface AlbumsResponse {
  status: string;
  message?: string;
  data: {
    total: number;
    start: number;
    results: Album[];
  };
}

export interface SongDetailsResponse {
  status: string;
  message?: string;
  data: Song;
}

export interface ArtistDetailsResponse {
  status: string;
  message?: string;
  data: Artist;
}

export interface AlbumDetailsResponse {
  status: string;
  message?: string;
  data: Album;
}

export interface ApiError {
  status: string;
  message: string;
  error?: string;
}
