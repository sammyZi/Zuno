/**
 * Navigation Ref
 * Shared ref for NavigationContainer, allowing navigation
 * from components outside the navigator tree (e.g. MiniPlayer).
 */

import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navigate from anywhere (outside screens).
 * Safe to call even before the navigator is mounted.
 */
export function navigate(name: keyof RootStackParamList, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params);
  }
}

/**
 * Get the active route name by traversing nested navigation state.
 */
export function getActiveRouteName(state: any): string | undefined {
  if (!state) return undefined;
  const route = state.routes[state.index];
  if (route.state) {
    return getActiveRouteName(route.state);
  }
  return route.name;
}
