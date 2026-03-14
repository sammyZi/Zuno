/**
 * RepeatTestComponent
 * Test component to verify repeat mode functionality
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayerStore } from '../../store/playerStore';
import { useQueueStore, RepeatMode } from '../../store/queueStore';
import { colors, spacing, typography } from '../../theme';

export const RepeatTestComponent: React.FC = () => {
  const { currentSong, isPlaying, position, duration } = usePlayerStore();
  const { repeat, setRepeat, queue, currentIndex } = useQueueStore();
  const [log, setLog] = useState<string[]>([]);

  // Log repeat mode changes
  useEffect(() => {
    addLog(`Repeat mode changed to: ${repeat}`);
  }, [repeat]);

  // Log song changes
  useEffect(() => {
    if (currentSong) {
      addLog(`Now playing: ${currentSong.name} (Index: ${currentIndex})`);
    }
  }, [currentSong?.id, currentIndex]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLog((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 20));
  };

  const handleRepeatToggle = () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const idx = modes.indexOf(repeat);
    const newMode = modes[(idx + 1) % modes.length];
    setRepeat(newMode);
  };

  const getRepeatIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (repeat) {
      case 'one':
        return 'repeat-outline';
      case 'all':
        return 'repeat';
      default:
        return 'repeat-outline';
    }
  };

  const getRepeatColor = () => {
    return repeat !== 'off' ? colors.secondary : colors.textMuted;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Repeat Mode Test</Text>

      {/* Current State */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current State</Text>
        <View style={styles.stateRow}>
          <Text style={styles.label}>Repeat Mode:</Text>
          <Text style={[styles.value, { color: getRepeatColor() }]}>
            {repeat.toUpperCase()}
          </Text>
        </View>
        <View style={styles.stateRow}>
          <Text style={styles.label}>Queue Size:</Text>
          <Text style={styles.value}>{queue.length} songs</Text>
        </View>
        <View style={styles.stateRow}>
          <Text style={styles.label}>Current Index:</Text>
          <Text style={styles.value}>{currentIndex + 1} / {queue.length}</Text>
        </View>
        <View style={styles.stateRow}>
          <Text style={styles.label}>Playing:</Text>
          <Text style={styles.value}>{isPlaying ? 'Yes' : 'No'}</Text>
        </View>
        {currentSong && (
          <>
            <View style={styles.stateRow}>
              <Text style={styles.label}>Song:</Text>
              <Text style={styles.value} numberOfLines={1}>
                {currentSong.name}
              </Text>
            </View>
            <View style={styles.stateRow}>
              <Text style={styles.label}>Progress:</Text>
              <Text style={styles.value}>
                {formatTime(position)} / {formatTime(duration)}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Repeat Control */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Repeat Control</Text>
        <TouchableOpacity style={styles.repeatButton} onPress={handleRepeatToggle}>
          <View style={styles.iconWithBadge}>
            <Ionicons name={getRepeatIcon()} size={32} color={getRepeatColor()} />
            {repeat === 'one' && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>1</Text>
              </View>
            )}
          </View>
          <Text style={styles.repeatButtonText}>
            Tap to cycle: OFF → ALL → ONE
          </Text>
        </TouchableOpacity>
      </View>

      {/* Expected Behavior */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expected Behavior</Text>
        <View style={styles.behaviorItem}>
          <Text style={styles.behaviorMode}>OFF:</Text>
          <Text style={styles.behaviorDesc}>Stop at end of queue</Text>
        </View>
        <View style={styles.behaviorItem}>
          <Text style={styles.behaviorMode}>ALL:</Text>
          <Text style={styles.behaviorDesc}>Restart queue from beginning</Text>
        </View>
        <View style={styles.behaviorItem}>
          <Text style={styles.behaviorMode}>ONE:</Text>
          <Text style={styles.behaviorDesc}>Replay same song continuously</Text>
        </View>
      </View>

      {/* Event Log */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Event Log</Text>
        <ScrollView style={styles.logContainer}>
          {log.map((entry, index) => (
            <Text key={index} style={styles.logEntry}>
              {entry}
            </Text>
          ))}
          {log.length === 0 && (
            <Text style={styles.logEmpty}>No events yet...</Text>
          )}
        </ScrollView>
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Instructions</Text>
        <Text style={styles.instruction}>
          1. Play a song from the queue
        </Text>
        <Text style={styles.instruction}>
          2. Toggle repeat mode using the button above
        </Text>
        <Text style={styles.instruction}>
          3. Let the song finish or skip to the end
        </Text>
        <Text style={styles.instruction}>
          4. Verify behavior matches the mode:
        </Text>
        <Text style={styles.instruction}>   • OFF: Stops at end</Text>
        <Text style={styles.instruction}>   • ALL: Restarts queue</Text>
        <Text style={styles.instruction}>   • ONE: Replays same song</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    padding: spacing.md,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  section: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 16,
    marginBottom: spacing.sm,
    color: colors.primary,
  },
  stateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  value: {
    ...typography.body,
    color: colors.textPrimary,
    fontFamily: 'Poppins_600SemiBold',
    flex: 2,
    textAlign: 'right',
  },
  repeatButton: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 12,
  },
  iconWithBadge: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Poppins_700Bold',
    color: colors.backgroundPrimary,
  },
  repeatButtonText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  behaviorItem: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
  },
  behaviorMode: {
    ...typography.body,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.secondary,
    width: 50,
  },
  behaviorDesc: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  logContainer: {
    maxHeight: 150,
  },
  logEntry: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingVertical: 2,
    fontFamily: 'Courier',
  },
  logEmpty: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  instruction: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingVertical: 2,
    lineHeight: 18,
  },
});
