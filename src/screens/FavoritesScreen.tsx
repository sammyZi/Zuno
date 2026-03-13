/**
 * Favorites Screen
 * Displays user's favorite songs
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export const FavoritesScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundPrimary} />
      <View style={styles.content}>
        <Text style={styles.text}>Favorites</Text>
        <Text style={styles.subtext}>Your favorite songs will appear here</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80, // Space for tab bar
    paddingHorizontal: spacing.md,
  },
  text: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  subtext: {
    ...typography.body,
    color: colors.textTertiary,
  },
});
