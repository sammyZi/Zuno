/**
 * Navigation Types
 * Defines the parameter list for all screens in the app
 */

import type { Song } from '../types/api';

/**
 * Bottom Tab Navigator Parameter List
 * Defines the screens accessible via bottom tabs
 */
export type TabParamList = {
  Home: undefined;
  Playlists: undefined;
  Favorites: undefined;
  Settings: undefined;
};

/**
 * Root Stack Navigator Parameter List
 * Defines all screens including modals and detail screens
 */
export type RootStackParamList = {
  MainTabs: undefined;
  Player: {
    song?: Song;
  };
  Queue: undefined;
  Search: undefined;
  Artist: {
    artistId: string;
  };
  Album: {
    albumId: string;
  };
  ComponentShowcase: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
