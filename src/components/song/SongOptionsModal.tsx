/**
 * Song Options Modal
 * Premium bottom sheet modal for song actions
 * Features: drag handle, gradient header, icon-accented options, working favorites
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Song } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { getImageUrl, getArtistNames } from '../../utils/audio';
import { PlaylistSelectorModal } from '../playlist/PlaylistSelectorModal';
import { useFavoritesStore } from '../../store/favoritesStore';

interface SongOptionsModalProps {
  visible: boolean;
  song: Song | null;
  onClose: () => void;
  onAddToQueue: () => void;
  onAddToPlaylist?: () => void;
}

export const SongOptionsModal: React.FC<SongOptionsModalProps> = ({
  visible,
  song,
  onClose,
  onAddToQueue,
  onAddToPlaylist,
}) => {
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  const { toggleFavorite, isFavorite } = useFavoritesStore();

  if (!song) return null;

  const imageUrl = getImageUrl(song.image, 'medium');
  const artistNames = getArtistNames(song);
  const isFav = isFavorite(song.id);

  const OPTION_ITEMS = [
    {
      key: 'queue',
      icon: 'add-circle-outline' as const,
      label: 'Add to Queue',
      subtitle: 'Play next in line',
      iconBg: 'rgba(94, 243, 204, 0.12)',
      iconColor: colors.secondary,
    },
    {
      key: 'playlist',
      icon: 'list-outline' as const,
      label: 'Add to Playlist',
      subtitle: 'Save to a collection',
      iconBg: 'rgba(255, 140, 40, 0.12)',
      iconColor: colors.primary,
    },
    {
      key: 'favorite',
      icon: isFav ? ('heart' as const) : ('heart-outline' as const),
      label: isFav ? 'Remove from Favorites' : 'Add to Favorites',
      subtitle: isFav ? 'Remove from your likes' : 'Keep it close',
      iconBg: isFav ? 'rgba(255, 75, 110, 0.2)' : 'rgba(255, 75, 110, 0.12)',
      iconColor: '#FF4B6E',
    },
    {
      key: 'share',
      icon: 'share-outline' as const,
      label: 'Share',
      subtitle: 'Send to a friend',
      iconBg: 'rgba(100, 140, 255, 0.12)',
      iconColor: '#648CFF',
    },
  ];

  const handleOptionPress = (key: string) => {
    switch (key) {
      case 'queue':
        onAddToQueue();
        onClose();
        break;
      case 'playlist':
        setShowPlaylistSelector(true);
        break;
      case 'favorite':
        toggleFavorite(song);
        // Don't close — let user see the state change
        break;
      case 'share':
        onClose();
        break;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              {/* Song Info Header with Gradient */}
              <LinearGradient
                colors={['rgba(255, 140, 40, 0.08)', 'transparent']}
                style={styles.headerGradient}
              >
                <View style={styles.header}>
                  <Image source={{ uri: imageUrl }} style={styles.albumArt} />
                  <View style={styles.songInfo}>
                    <Text style={styles.songTitle} numberOfLines={2}>
                      {song.name}
                    </Text>
                    <Text style={styles.artistName} numberOfLines={1}>
                      {artistNames}
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Options */}
              <View style={styles.options}>
                {OPTION_ITEMS.map((item, index) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.option,
                      index === OPTION_ITEMS.length - 1 && styles.optionLast,
                    ]}
                    onPress={() => handleOptionPress(item.key)}
                    activeOpacity={0.6}
                  >
                    <View style={[styles.optionIconBg, { backgroundColor: item.iconBg }]}>
                      <Ionicons name={item.icon} size={22} color={item.iconColor} />
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionLabel}>{item.label}</Text>
                      <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ opacity: 0.4 }} />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Cancel Button */}
              <View style={styles.cancelContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {/* Playlist Selector Modal */}
      <PlaylistSelectorModal
        visible={showPlaylistSelector}
        song={song}
        onClose={() => setShowPlaylistSelector(false)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: spacing.xl + 8,
  },
  headerGradient: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  albumArt: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.medium,
    marginRight: spacing.md,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 17,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
    lineHeight: 23,
    marginBottom: 3,
  },
  artistName: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginHorizontal: spacing.lg,
  },
  options: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderRadius: borderRadius.medium,
  },
  optionLast: {
    // no bottom margin for last item
  },
  optionIconBg: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: colors.textPrimary,
    marginBottom: 1,
  },
  optionSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
  },
  cancelContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  cancelButton: {
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.medium,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textMuted,
  },
});
