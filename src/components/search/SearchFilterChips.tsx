/**
 * SearchFilterChips Component
 * Horizontal scrollable filter chips for search categories
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';

export type SearchFilter = 'Songs' | 'Artists' | 'Albums' | 'Folders';

interface SearchFilterChipsProps {
  filters: SearchFilter[];
  activeFilter: SearchFilter;
  onFilterChange: (filter: SearchFilter) => void;
}

export const SearchFilterChips: React.FC<SearchFilterChipsProps> = ({
  filters,
  activeFilter,
  onFilterChange,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scrollView}
    >
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.chip,
            activeFilter === filter && styles.chipActive,
          ]}
          onPress={() => onFilterChange(filter)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.chipText,
              activeFilter === filter && styles.chipTextActive,
            ]}
          >
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 44,
  },
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.round,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: colors.primary,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  chipTextActive: {
    color: colors.backgroundPrimary,
  },
});
