/**
 * SearchFilterChips Component
 * Horizontal scrollable filter chips for search categories
 * Uses TouchableOpacity instead of Pressable+android_ripple to avoid
 * visual artifacts where the old chip appears stuck as active.
 */

import React from 'react';
import {
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

// Individual chip component with its own key for clean re-rendering
const FilterChip = React.memo(({
  label,
  isActive,
  onPress,
}: {
  label: SearchFilter;
  isActive: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    style={[
      styles.chip,
      isActive ? styles.chipActive : styles.chipInactive,
    ]}
  >
    <Text
      style={[
        styles.chipText,
        isActive ? styles.chipTextActive : styles.chipTextInactive,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
));

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
        <FilterChip
          key={`${filter}-${activeFilter === filter}`}
          label={filter}
          isActive={activeFilter === filter}
          onPress={() => onFilterChange(filter)}
        />
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipInactive: {
    backgroundColor: 'transparent',
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  chipTextActive: {
    color: colors.backgroundPrimary,
  },
  chipTextInactive: {
    color: colors.primary,
  },
});
