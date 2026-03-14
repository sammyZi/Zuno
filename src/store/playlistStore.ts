import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Song } from '../types/api';

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
}

interface PlaylistState {
  playlists: Playlist[];
  createPlaylist: (name: string) => void;
  deletePlaylist: (id: string) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  getPlaylist: (id: string) => Playlist | undefined;
}

export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set, get) => ({
      playlists: [],

      createPlaylist: (name) => {
        const newPlaylist: Playlist = {
          id: Date.now().toString(),
          name,
          songs: [],
          createdAt: Date.now(),
        };
        set({ playlists: [newPlaylist, ...get().playlists] });
      },

      deletePlaylist: (id) => {
        set({
          playlists: get().playlists.filter((p) => p.id !== id),
        });
      },

      addSongToPlaylist: (playlistId, song) => {
        set({
          playlists: get().playlists.map((playlist) => {
            if (playlist.id === playlistId) {
              // Check if song already exists
              if (!playlist.songs.some((s) => s.id === song.id)) {
                return {
                  ...playlist,
                  songs: [...playlist.songs, song],
                };
              }
            }
            return playlist;
          }),
        });
      },

      removeSongFromPlaylist: (playlistId, songId) => {
        set({
          playlists: get().playlists.map((playlist) => {
            if (playlist.id === playlistId) {
              return {
                ...playlist,
                songs: playlist.songs.filter((s) => s.id !== songId),
              };
            }
            return playlist;
          }),
        });
      },

      getPlaylist: (id) => {
        return get().playlists.find((p) => p.id === id);
      },
    }),
    {
      name: 'music-player-playlists',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
