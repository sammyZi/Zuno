/**
 * Tab Navigator
 * Modern bottom tab navigation with glassmorphism effect
 * Features: Blur background, rounded corners, smaller icons, proper spacing
 */

import React from 'react';
import { Platform, StyleSheet } from 'react-native';
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

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        // Remove headers from all screens
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(31, 34, 42, 0.85)', // Glass effect
          borderTopWidth: 0,
          elevation: 8,
          height: 70,
          paddingBottom: 10,
          paddingTop: 6,
          paddingHorizontal: 16,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          // Subtle shadow for elevation
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: colors.primary, // #FF8C28
        tabBarInactiveTintColor: colors.textMuted, // #B3B3B3
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
        // Glassmorphism blur effect for iOS
        ...(Platform.OS === 'ios' && {
          tabBarBackground: () => (
            <BlurView
              intensity={95}
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
          ),
        }),
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={20} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Playlists"
        component={PlaylistsScreen}
        options={{
          title: 'Queue',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "list" : "list-outline"} 
              size={20} 
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
              name={focused ? "heart" : "heart-outline"} 
              size={20} 
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
              name={focused ? "settings" : "settings-outline"} 
              size={20} 
              color={color} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
