/**
 * SearchEmptyState Component
 * "Not Found" state with sad emoji illustration
 * Reference: 21_Dark_search result not found.png
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface SearchEmptyStateProps {
  query?: string;
}

export const SearchEmptyState: React.FC<SearchEmptyStateProps> = ({ query }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="sad-outline" size={64} color={colors.primary} />
      </View>
      <Text style={styles.title}>Not Found</Text>
      <Text style={styles.subtitle}>
        Sorry, the keyword you entered cannot be found, please check again or search with another keyword.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
