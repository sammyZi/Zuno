/**
 * SearchFilterChips Component
 * Horizontal scrollable filter chips for search categories
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
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
        <Pressable
          key={filter}
          style={({ pressed }) => [
            styles.chip,
            activeFilter === filter && styles.chipActive,
            pressed && styles.chipPressed,
          ]}
          onPress={() => onFilterChange(filter)}
          android_ripple={{
            color: activeFilter === filter ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 138, 0, 0.3)',
            borderless: false,
          }}
        >
          <Text
            style={[
              styles.chipText,
              activeFilter === filter && styles.chipTextActive,
            ]}
          >
            {filter}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 50,
    flexGrow: 0,
  },
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
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
