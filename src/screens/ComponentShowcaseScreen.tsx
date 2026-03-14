import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { AlbumArt } from '../components/song/AlbumArt';
import { SongItem } from '../components/song/SongItem';
import { ProgressBar } from '../components/player/ProgressBar';
import { PlayerControls } from '../components/player/PlayerControls';
import { colors, spacing, typography, borderRadius } from '../theme';

export const ComponentShowcaseScreen: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(30000); // 30 seconds
  const duration = 180000; // 3 minutes

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundPrimary} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Component Showcase</Text>
          <Text style={styles.headerSubtitle}>Design System · Music App</Text>
        </View>

        {/* Buttons Section */}
        <SectionCard title="Buttons">
          <Button variant="primary" title="Primary Button" onPress={() => {}} />
          <Button
            variant="secondary"
            title="Secondary Button"
            onPress={() => {}}
          />
          <Button
            variant="primary"
            icon="heart"
            title="With Icon"
            onPress={() => {}}
          />
          <View style={styles.iconRow}>
            <Button variant="icon" icon="heart" onPress={() => {}} />
            <Button variant="icon" icon="shuffle" onPress={() => {}} />
            <Button variant="icon" icon="repeat" onPress={() => {}} />
            <Button variant="icon" icon="bookmark" onPress={() => {}} />
          </View>
          <Button
            variant="primary"
            title="Loading State"
            loading
            onPress={() => {}}
          />
          <Button
            variant="primary"
            title="Disabled State"
            disabled
            onPress={() => {}}
          />
        </SectionCard>

        {/* Loading Spinner */}
        <SectionCard title="Loading Spinner">
          <View style={styles.spinnerRow}>
            <LoadingSpinner size="small" style={styles.spinnerItem} />
            <LoadingSpinner size="large" style={styles.spinnerItem} />
            <LoadingSpinner
              size="large"
              color={colors.secondary}
              label="Buffering..."
              style={styles.spinnerItem}
            />
          </View>
        </SectionCard>

        {/* Error Message */}
        <SectionCard title="Error Message">
          <ErrorMessage
            message="Unable to connect to music service. Check your connection and try again."
            onRetry={() => console.log('Retry')}
          />
        </SectionCard>

        {/* Album Art */}
        <SectionCard title="Album Art">
          <View style={styles.albumArtRow}>
            <View style={styles.albumArtItem}>
              <AlbumArt size="mini" />
              <Text style={styles.sizeLabel}>mini</Text>
            </View>
            <View style={styles.albumArtItem}>
              <AlbumArt size="small" />
              <Text style={styles.sizeLabel}>small</Text>
            </View>
            <View style={styles.albumArtItem}>
              <AlbumArt size="medium" />
              <Text style={styles.sizeLabel}>medium</Text>
            </View>
            <View style={styles.albumArtItem}>
              <AlbumArt size="large" />
              <Text style={styles.sizeLabel}>large</Text>
            </View>
          </View>
        </SectionCard>

        {/* Song Items */}
        <SectionCard title="Song Item">
          <SongItem
            song={{ id: 'mock1', name: 'Blinding Lights', duration: 200, image: [], downloadUrl: [], primaryArtists: 'The Weeknd' } as any}
            title="Blinding Lights"
            artist="The Weeknd"
            duration="3:20"
            onPress={() => console.log('Song pressed')}
            onMorePress={() => console.log('More pressed')}
          />
          <SongItem
            song={{ id: 'mock2', name: 'Currently Playing', duration: 255, image: [], downloadUrl: [], primaryArtists: 'Artist Name' } as any}
            title="Currently Playing Song"
            artist="Artist Name"
            duration="4:15"
            isPlaying
            onPress={() => console.log('Song pressed')}
            onMorePress={() => console.log('More pressed')}
          />
        </SectionCard>

        {/* Progress Bar */}
        <SectionCard title="Progress Bar (Slider)">
          <ProgressBar
            currentPosition={position}
            duration={duration}
            onSeek={(pos) => setPosition(pos)}
            showTimeLabels
          />
        </SectionCard>

        {/* Player Controls */}
        <SectionCard title="Player Controls">
          <PlayerControls
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onNext={() => console.log('Next')}
            onPrevious={() => console.log('Previous')}
          />
          <PlayerControls
            isPlaying={false}
            onPlayPause={() => {}}
            onNext={() => {}}
            onPrevious={() => {}}
            disableNext
            disablePrevious
          />
        </SectionCard>
      </ScrollView>
    </SafeAreaView>
  );
};

/** Small helper: a titled card section */
const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <View style={sectionStyles.card}>
    <Text style={sectionStyles.title}>{title}</Text>
    <View style={sectionStyles.content}>{children}</View>
  </View>
);

const sectionStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.large,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.backgroundTertiary,
  },
  title: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl + spacing.xl, // Extra bottom padding to prevent cutoff
  },
  header: {
    paddingVertical: spacing.lg,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textMuted,
  },
  iconRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  spinnerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    minHeight: 100,
  },
  spinnerItem: {
    flex: 1,
  },
  albumArtRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  albumArtItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  sizeLabel: {
    ...typography.small,
    color: colors.textMuted,
  },
});
