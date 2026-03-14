/**
 * Network Utilities
 * Check network connectivity status
 */

import NetInfo from '@react-native-community/netinfo';

/**
 * Check if device is online
 */
export const isOnline = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable !== false;
  } catch (error) {
    console.error('Error checking network status:', error);
    return false;
  }
};

/**
 * Subscribe to network status changes
 */
export const subscribeToNetworkStatus = (
  callback: (isConnected: boolean) => void
): (() => void) => {
  const unsubscribe = NetInfo.addEventListener(state => {
    const connected = state.isConnected === true && state.isInternetReachable !== false;
    callback(connected);
  });

  return unsubscribe;
};
