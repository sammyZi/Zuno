/**
 * RecentSearches Component
 * Display list of recent search terms with clear functionality
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';

interface RecentSearchesProps {
  searches: string[];
  onSearchPress: (term: string) => void;
  onRemoveSearch: (term: string) => void;
  onClearAll: () => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  searches,
  onSearchPress,
  onRemoveSearch,
  onClearAll,
}) => {
  if (searches.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Searches</Text>
        <Pressable
          onPress={onClearAll}
          style={({ pressed }) => pressed && styles.clearAllPressed}
          android_ripple={{ color: 'rgba(255, 138, 0, 0.2)', borderless: true }}
        >
          <Text style={styles.clearAllText}>Clear All</Text>
        </Pressable>
      </View>
      <View style={styles.divider} />
      {searches.map((term, index) => (
        <Pressable
          key={`${term}-${index}`}
          style={({ pressed }) => [
            styles.item,
            pressed && styles.itemPressed,
          ]}
          onPress={() => onSearchPress(term)}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
        >
          <Text style={styles.itemText}>{term}</Text>
          <Pressable
            onPress={() => onRemoveSearch(term)}
            style={({ pressed }) => pressed && styles.removePressed}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.2)', borderless: true, radius: 12 }}
          >
            <Ionicons name="close" size={18} color={colors.textMuted} />
          </Pressable>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: colors.textPrimary,
  },
  clearAllText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: colors.primary,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  itemText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: colors.textPrimary,
  },
  clearAllPressed: {
    opacity: 0.6,
  },
  itemPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  removePressed: {
    opacity: 0.5,
  },
});
