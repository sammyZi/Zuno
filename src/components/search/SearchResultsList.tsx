/**
 * SearchResultsList Component
 * Display categorized search results (Songs, Artists, Albums)
 * Reference: 22_Dark_search results list.png
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Song, Artist, Album } from '../../types/api';
import { colors, spacing, borderRadius } from '../../theme';
import { SongItem } from '../song';
import { getImageUrl, formatDuration, getArtistNames } from '../../utils/audio';

interface SearchResultsListProps {
  songs: Song[];
  artists: Artist[];
  albums: Album[];
  activeFilter: 'Songs' | 'Artists' | 'Albums' | 'Folders';
  currentSongId?: string;
  onSongPress: (song: Song) => void;
  onSongMorePress: (song: Song) => void;
  onArtistPress: (artist: Artist) => void;
  onAlbumPress: (album: Album) => void;
}

export const SearchResultsList: React.FC<SearchResultsListProps> = ({
  songs,
  artists,
  albums,
  activeFilter,
  currentSongId,
  onSongPress,
  onSongMorePress,
  onArtistPress,
  onAlbumPress,
}) => {
  // Render Songs
  if (activeFilter === 'Songs' && songs.length > 0) {
    return (
      <View style={styles.section}>
        {songs.map((song, index) => (
          <SongItem
            key={`search-song-${song.id}-${index}`}
            song={song}
            title={song.name}
            artist={getArtistNames(song)}
            duration={formatDuration(song.duration)}
            albumArtUri={getImageUrl(song.image)}
            onPress={() => onSongPress(song)}
            onMorePress={() => onSongMorePress(song)}
            isPlaying={currentSongId === song.id}
            style={styles.songItem}
          />
        ))}
      </View>
    );
  }

  // Render Artists
  if (activeFilter === 'Artists' && artists.length > 0) {
    return (
      <View style={styles.section}>
        {artists.map((artist, index) => {
          const imageUri = getImageUrl(artist.image);
          return (
            <TouchableOpacity
              key={`search-artist-${artist.id}-${index}`}
              style={styles.artistResult}
              onPress={() => onArtistPress(artist)}
              activeOpacity={0.7}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.artistImage} />
              ) : (
                <View style={[styles.artistImage, styles.artistPlaceholder]}>
                  <Text style={styles.artistLetter}>
                    {artist.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.artistInfo}>
                <Text style={styles.artistName} numberOfLines={1}>
                  {artist.name}
                </Text>
                <Text style={styles.artistSubtitle} numberOfLines={1}>
                  Artist
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  // Render Albums
  if (activeFilter === 'Albums' && albums.length > 0) {
    return (
      <View style={styles.section}>
        {albums.map((album, index) => {
          const imageUri = getImageUrl(album.image);
          return (
            <TouchableOpacity
              key={`search-album-${album.id}-${index}`}
              style={styles.albumResult}
              onPress={() => onAlbumPress(album)}
              activeOpacity={0.7}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.albumImage} />
              ) : (
                <View style={[styles.albumImage, styles.albumPlaceholder]}>
                  <Ionicons name="disc" size={20} color={colors.textMuted} />
                </View>
              )}
              <View style={styles.albumInfo}>
                <Text style={styles.albumName} numberOfLines={1}>
                  {album.name}
                </Text>
                <Text style={styles.albumSubtitle} numberOfLines={1}>
                  {album.primaryArtists || 'Album'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.md,
  },
  songItem: {
    marginBottom: 2,
  },

  // Artist Results
  artistResult: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
  },
  artistImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundTertiary,
    flexShrink: 0,
  },
  artistPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistLetter: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.primary,
  },
  artistInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  artistName: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  artistSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
  },

  // Album Results
  albumResult: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
  },
  albumImage: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.small,
    backgroundColor: colors.backgroundTertiary,
    flexShrink: 0,
  },
  albumPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  albumName: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  albumSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
  },
});
