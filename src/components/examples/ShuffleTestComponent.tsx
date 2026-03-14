/**
 * Shuffle Test Component
 * 
 * A simple component to manually test shuffle functionality
 * Add this to a screen to test shuffle with various queue sizes
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQueueStore } from '../../store/queueStore';
import { colors, spacing, typography } from '../../theme';
import { Song } from '../../types';

// Mock song generator
const createMockSong = (id: string, name: string): Song => ({
  id,
  name,
  duration: 180,
  language: 'english',
  album: {
    id: `album-${id}`,
    name: `Album ${id}`,
  },
  artists: {
    primary: [
      {
        id: `artist-${id}`,
        name: `Artist ${id}`,
      },
    ],
  },
  image: [],
  downloadUrl: [],
});

const generateQueue = (size: number): Song[] => {
  return Array.from({ length: size }, (_, i) =>
    createMockSong(`test-song-${i + 1}`, `Test Song ${i + 1}`)
  );
};

export const ShuffleTestComponent: React.FC = () => {
  const { queue, shuffle, toggleShuffle, setQueue, currentIndex } = useQueueStore();
  const [originalOrder, setOriginalOrder] = useState<string[]>([]);

  const testShuffle = (size: number) => {
    const testQueue = generateQueue(size);
    setQueue(testQueue, 0);
    setOriginalOrder(testQueue.map(s => s.name));
    Alert.alert(
      'Test Queue Created',
      `Created queue with ${size} songs. Now tap shuffle to test!`
    );
  };

  const verifyOrder = () => {
    const currentOrder = queue.map(s => s.name);
    const isSame = currentOrder.every((name, i) => name === originalOrder[i]);
    
    if (shuffle) {
      Alert.alert(
        'Shuffle Verification',
        isSame
          ? '⚠️ Order is the same (might happen with small queues)'
          : '✓ Order is different - Shuffle working!'
      );
    } else {
      Alert.alert(
        'Original Order Verification',
        isSame
          ? '✓ Original order restored!'
          : '✗ Original order NOT restored'
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="flask" size={32} color={colors.primary} />
        <Text style={styles.title}>Shuffle Test Suite</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current State</Text>
        <View style={styles.stateRow}>
          <Text style={styles.stateLabel}>Queue Size:</Text>
          <Text style={styles.stateValue}>{queue.length} songs</Text>
        </View>
        <View style={styles.stateRow}>
          <Text style={styles.stateLabel}>Shuffle:</Text>
          <View style={styles.stateValueRow}>
            <Ionicons
              name={shuffle ? 'shuffle' : 'shuffle-outline'}
              size={20}
              color={shuffle ? colors.secondary : colors.textMuted}
            />
            <Text style={[styles.stateValue, { color: shuffle ? colors.secondary : colors.textMuted }]}>
              {shuffle ? 'ON' : 'OFF'}
            </Text>
          </View>
        </View>
        <View style={styles.stateRow}>
          <Text style={styles.stateLabel}>Current Index:</Text>
          <Text style={styles.stateValue}>{currentIndex}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Cases</Text>
        
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => testShuffle(1)}
        >
          <Text style={styles.testButtonText}>Test 1: Single Song</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          onPress={() => testShuffle(5)}
        >
          <Text style={styles.testButtonText}>Test 2: Small Queue (5 songs)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          onPress={() => testShuffle(15)}
        >
          <Text style={styles.testButtonText}>Test 3: Medium Queue (15 songs)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          onPress={() => testShuffle(50)}
        >
          <Text style={styles.testButtonText}>Test 4: Large Queue (50 songs)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <TouchableOpacity
          style={[styles.actionButton, shuffle && styles.actionButtonActive]}
          onPress={toggleShuffle}
        >
          <Ionicons
            name={shuffle ? 'shuffle' : 'shuffle-outline'}
            size={24}
            color={shuffle ? colors.backgroundPrimary : colors.textPrimary}
          />
          <Text style={[styles.actionButtonText, shuffle && styles.actionButtonTextActive]}>
            Toggle Shuffle
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={verifyOrder}
          disabled={queue.length === 0}
        >
          <Ionicons name="checkmark-circle-outline" size={24} color={colors.textPrimary} />
          <Text style={styles.actionButtonText}>Verify Order</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Queue</Text>
        {queue.length === 0 ? (
          <Text style={styles.emptyText}>No songs in queue. Create a test queue above.</Text>
        ) : (
          queue.slice(0, 10).map((song, index) => (
            <View
              key={song.id}
              style={[
                styles.songItem,
                index === currentIndex && styles.songItemCurrent,
              ]}
            >
              <Text style={styles.songIndex}>{index + 1}</Text>
              <Text style={styles.songName}>{song.name}</Text>
              {index === currentIndex && (
                <Ionicons name="play-circle" size={16} color={colors.primary} />
              )}
            </View>
          ))
        )}
        {queue.length > 10 && (
          <Text style={styles.moreText}>... and {queue.length - 10} more songs</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Instructions</Text>
        <Text style={styles.instructionText}>
          1. Create a test queue using buttons above{'\n'}
          2. Toggle shuffle ON - verify icon turns cyan (#5EF3CC){'\n'}
          3. Check queue order changes{'\n'}
          4. Toggle shuffle OFF - verify original order restored{'\n'}
          5. Close and reopen app - verify state persists
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundSecondary,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  stateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  stateLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  stateValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  stateValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  testButton: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  testButtonText: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  actionButtonActive: {
    backgroundColor: colors.secondary,
  },
  actionButtonText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  actionButtonTextActive: {
    color: colors.backgroundPrimary,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 6,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  songItemCurrent: {
    backgroundColor: colors.backgroundTertiary,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  songIndex: {
    ...typography.caption,
    color: colors.textMuted,
    width: 24,
  },
  songName: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  moreText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  instructionText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
});
