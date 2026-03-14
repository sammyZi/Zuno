/**
 * Recently Played Screen
 * Shows all recently played songs from history
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  Platform,
  TouchableOpacity,
} from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList, TabParamList } from '../navigation/types';
import { colors, spacing, typography, borderRadius } from '../theme';
import { SongItem } from '../components/song';
import { usePlayerStore, useQueueStore, useHistoryStore } from '../store';
import { getImageUrl, formatDuration, getArtistNames } from '../utils/audio';
import { Ionicons } from '@expo/vector-icons';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  StackScreenProps<RootStackParamList>
>;

export const RecentlyPlayedScreen: React.FC<Props> = ({ navigation }) => {
  const { currentSong, play } = usePlayerStore();
  const { playAndBuildQueue } = useQueueStore();
  const { getRecentlyPlayed } = useHistoryStore();

  const recentlyPlayed = getRecentlyPlayed(50); // Get last 50 songs

  const handleSongPress = (song: any, index: number) => {
    playAndBuildQueue(song, recentlyPlayed);
    play(song);
    navigation.navigate('Player', { song });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="time-outline" size={64} color={colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>No Recently Played</Text>
      <Text style={styles.emptySubtitle}>
        Start playing music to see your history here
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundPrimary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recently Played</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* List */}
      <FlatList
        data={recentlyPlayed}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item, index }) => (
          <SongItem
            song={item}
            title={item.name}
            artist={getArtistNames(item)}
            duration={formatDuration(item.duration)}
            albumArtUri={getImageUrl(item.image)}
            onPress={() => handleSongPress(item, index)}
            isPlaying={currentSong?.id === item.id}
            style={styles.songItem}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          recentlyPlayed.length === 0 && styles.listEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 44,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 120,
  },
  listEmpty: {
    flexGrow: 1,
  },
  songItem: {
    marginBottom: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: -80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
