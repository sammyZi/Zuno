/**
 * App Navigator
 * Main navigation with Stack Navigator wrapping Bottom Tabs
 * All headers removed for clean, minimal design
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, NavigationState } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import type { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import {
  PlayerScreen,
  QueueScreen,
  SearchScreen,
  ArtistScreen,
  AlbumScreen,
} from '../screens';
import { ComponentShowcaseScreen } from '../screens/ComponentShowcaseScreen';
import { PlaylistDetailScreen } from '../screens/PlaylistDetailScreen';
import { MiniPlayer } from '../components/player';
import { colors } from '../theme/colors';
import { navigationRef, getActiveRouteName } from './navigationRef';

const Stack = createStackNavigator<RootStackParamList>();

/**
 * Dark theme configuration - consistent across all screens
 */
const DarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary, // #FF8C28
    background: colors.backgroundPrimary, // #181A20
    card: colors.backgroundSecondary, // #1F222A
    text: colors.textPrimary, // #FFFFFF
    border: 'transparent', // Remove borders
    notification: colors.primary, // #FF8C28
  },
};

export const AppNavigator: React.FC = () => {
  const [currentRouteName, setCurrentRouteName] = useState<string | undefined>('Home');

  const onStateChange = useCallback((state: NavigationState | undefined) => {
    const routeName = getActiveRouteName(state);
    setCurrentRouteName(routeName);
  }, []);

  return (
    <NavigationContainer theme={DarkTheme} ref={navigationRef} onStateChange={onStateChange}>
      <View style={styles.container}>
        <Stack.Navigator
          initialRouteName="MainTabs"
          screenOptions={{
            headerShown: false, // No headers on any screen
            cardStyle: {
              backgroundColor: colors.backgroundPrimary,
            },
            // Smooth fade transition
            cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
          }}
        >
          {/* Main Bottom Tabs */}
          <Stack.Screen
            name="MainTabs"
            component={TabNavigator}
            options={{
              headerShown: false,
            }}
          />

          {/* Player Screen – Full-screen slide-up with swipe-down dismiss */}
          <Stack.Screen
            name="Player"
            component={PlayerScreen}
            options={{
              headerShown: false,
              cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
              gestureEnabled: true,
              gestureDirection: 'vertical',
              transitionSpec: {
                open: {
                  animation: 'spring',
                  config: { damping: 20, stiffness: 200, mass: 0.8 },
                },
                close: {
                  animation: 'spring',
                  config: { damping: 20, stiffness: 200, mass: 0.8 },
                },
              },
              cardStyle: {
                backgroundColor: colors.backgroundPrimary,
              },
            }}
          />

          {/* Stack Screens - All without headers */}
          <Stack.Screen
            name="Queue"
            component={QueueScreen}
            options={{
              headerShown: false,
              cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
              gestureEnabled: true,
              gestureDirection: 'vertical',
              transitionSpec: {
                open: {
                  animation: 'spring',
                  config: { damping: 22, stiffness: 220, mass: 0.8 },
                },
                close: {
                  animation: 'spring',
                  config: { damping: 22, stiffness: 220, mass: 0.8 },
                },
              },
            }}
          />
          <Stack.Screen
            name="Search"
            component={SearchScreen}
            options={{
              headerShown: false,
              cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
            }}
          />
          <Stack.Screen
            name="Artist"
            component={ArtistScreen}
            options={{
              headerShown: false,
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
          />
          <Stack.Screen
            name="Album"
            component={AlbumScreen}
            options={{
              headerShown: false,
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
          />
          <Stack.Screen
            name="PlaylistDetail"
            component={PlaylistDetailScreen}
            options={{
              headerShown: false,
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
          />
          <Stack.Screen
            name="ComponentShowcase"
            component={ComponentShowcaseScreen}
            options={{
              headerShown: false,
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
          />
        </Stack.Navigator>
        
        {/* Mini Player - Persistent across all screens except Player */}
        <MiniPlayer currentRouteName={currentRouteName} />
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
