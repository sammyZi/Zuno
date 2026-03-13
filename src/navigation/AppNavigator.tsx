/**
 * App Navigator
 * Main navigation with Stack Navigator wrapping Bottom Tabs
 * All headers removed for clean, minimal design
 */

import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
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
import { colors } from '../theme/colors';

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
  return (
    <NavigationContainer theme={DarkTheme}>
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

        {/* Modal Screens */}
        <Stack.Screen
          name="Player"
          component={PlayerScreen}
          options={{
            presentation: 'modal',
            headerShown: false,
            cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
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
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};
