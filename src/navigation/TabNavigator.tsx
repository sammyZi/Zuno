/**
 * Tab Navigator
 * Bottom tab navigation matching Figma design
 * Tabs: Home, Favorites, Playlists, Settings
 */

import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import type { TabParamList } from './types';
import {
  HomeScreen,
  PlaylistsScreen,
  FavoritesScreen,
  SettingsScreen,
} from '../screens';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator<TabParamList>();

/**
 * Tab bar background
 * Dark semi-transparent on both platforms
 */
const TabBarBackground = () => {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={80}
        tint="dark"
        style={[
          StyleSheet.absoluteFill,
          {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            overflow: 'hidden',
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: 'rgba(24, 26, 32, 0.95)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        },
      ]}
    />
  );
};

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 6,
          paddingHorizontal: 16,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: 'Poppins_500Medium',
          fontSize: 10,
          marginTop: 2,
          letterSpacing: 0.3,
        },
        tabBarIconStyle: {
          marginTop: -8,
        },
        tabBarItemStyle: {
          paddingVertical: 6,
        },
        tabBarBackground: () => <TabBarBackground />,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'heart' : 'heart-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Playlists"
        component={PlaylistsScreen}
        options={{
          title: 'Playlists',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'list' : 'list-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
