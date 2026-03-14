/**
 * RecentSearches Component
 * Display list of recent search terms with clear functionality
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
        <TouchableOpacity onPress={onClearAll}>
          <Text style={styles.clearAllText}>Clear All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />
      {searches.map((term, index) => (
        <TouchableOpacity
          key={`${term}-${index}`}
          style={styles.item}
          onPress={() => onSearchPress(term)}
          activeOpacity={0.7}
        >
          <Text style={styles.itemText}>{term}</Text>
          <TouchableOpacity
            onPress={() => onRemoveSearch(term)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </TouchableOpacity>
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
});
