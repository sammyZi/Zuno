/**
 * Audio Utility Functions
 * Helper functions for audio URL, image URL, duration formatting, and artist names
 */

import type { Song } from '../types/api';

/**
 * Get audio URL with quality preference
 * Prefers 320kbps > 160kbps > 96kbps
 * @param song - Song object
 * @returns Audio URL string
 */
export const getAudioUrl = (song: Song): string => {
  if (!song.downloadUrl || song.downloadUrl.length === 0) {
    return '';
  }

  // Quality preference order
  const qualities = ['320kbps', '160kbps', '96kbps'];

  for (const quality of qualities) {
    const audioUrl = song.downloadUrl.find((url) => url.quality === quality);
    if (audioUrl && audioUrl.url) {
      return audioUrl.url;
    }
  }

  // Fallback to first available URL
  return song.downloadUrl[0]?.url || '';
};

/**
 * Get image URL with highest quality
 * @param images - Array of image objects with quality and url
 * @param preferredQuality - Preferred quality (default: '500x500')
 * @returns Image URL string
 */
export const getImageUrl = (
  images: Array<{ quality: string; url: string }>,
  preferredQuality: string = '500x500'
): string => {
  if (!images || images.length === 0) {
    return '';
  }

  // Try to find preferred quality
  const preferredImage = images.find(
    (img) => img.quality === preferredQuality
  );
  if (preferredImage && preferredImage.url) {
    return preferredImage.url;
  }

  // Quality preference order
  const qualities = ['500x500', '150x150', '50x50'];

  for (const quality of qualities) {
    const image = images.find((img) => img.quality === quality);
    if (image && image.url) {
      return image.url;
    }
  }

  // Fallback to first available URL
  return images[0]?.url || '';
};

/**
 * Format duration from seconds to MM:SS format
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (MM:SS)
 */
export const formatDuration = (seconds: number): string => {
  if (!seconds || seconds < 0) {
    return '0:00';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Get artist names from song object
 * @param song - Song object
 * @param separator - Separator string (default: ', ')
 * @returns Comma-separated artist names
 */
export const getArtistNames = (song: Song, separator: string = ', '): string => {
  if (!song.artists) {
    return 'Unknown Artist';
  }

  // Try primary artists first
  if (song.artists.primary && song.artists.primary.length > 0) {
    return song.artists.primary.map((artist) => artist.name).join(separator);
  }

  // Fallback to primaryArtists string if available
  if (song.primaryArtists) {
    return song.primaryArtists;
  }

  // Fallback to all artists
  if (song.artists.all && song.artists.all.length > 0) {
    return song.artists.all.map((artist) => artist.name).join(separator);
  }

  return 'Unknown Artist';
};

/**
 * Get album name from song object
 * @param song - Song object
 * @returns Album name
 */
export const getAlbumName = (song: Song): string => {
  return song.album?.name || 'Unknown Album';
};

/**
 * Get song year from song object
 * @param song - Song object
 * @returns Year string
 */
export const getSongYear = (song: Song): string => {
  return song.year || song.releaseDate?.split('-')[0] || '';
};
