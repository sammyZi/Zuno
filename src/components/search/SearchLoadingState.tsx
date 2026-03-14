/**
 * SearchLoadingState Component
 * Loading indicator during search
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export const SearchLoadingState: React.FC = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>Searching...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  text: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});
