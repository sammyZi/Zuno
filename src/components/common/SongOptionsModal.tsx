/**
 * Song Options Modal Component
 * Shows options for a song including download, add to playlist, etc.
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Song } from '../../types/api';
import { getImageUrl, getArtistNames } from '../../utils/audio';

interface SongOptionsModalProps {
  visible: boolean;
  song: Song | null;
  isDownloaded: boolean;
  isDownloading: boolean;
  onClose: () => void;
  onDownload: () => void;
  onDeleteDownload: () => void;
  onAddToQueue: () => void;
  onAddToPlaylist?: () => void;
}

export const SongOptionsModal: React.FC<SongOptionsModalProps> = ({
  visible,
  song,
  isDownloaded,
  isDownloading,
  onClose,
  onDownload,
  onDeleteDownload,
  onAddToQueue,
  onAddToPlaylist,
}) => {
  if (!song) return null;

  const imageUrl = getImageUrl(song.image);
  const artistNames = getArtistNames(song);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modal}>
            {/* Song Info Header */}
            <View style={styles.songHeader}>
              <Image source={{ uri: imageUrl }} style={styles.albumArt} />
              <View style={styles.songInfo}>
                <Text style={styles.songTitle} numberOfLines={2}>
                  {song.name}
                </Text>
                <Text style={styles.songArtist} numberOfLines={1}>
                  {artistNames}
                </Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Options */}
            <View style={styles.options}>
              {/* Download / Delete Download */}
              {isDownloaded ? (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onDeleteDownload();
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.optionIcon, { backgroundColor: colors.error + '15' }]}>
                    <Ionicons name="trash-outline" size={22} color={colors.error} />
                  </View>
                  <Text style={styles.optionText}>Delete Download</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onDownload();
                    onClose();
                  }}
                  disabled={isDownloading}
                  activeOpacity={0.7}
                >
                  <View style={[styles.optionIcon, { backgroundColor: colors.secondary + '15' }]}>
                    <Ionicons 
                      name={isDownloading ? "hourglass-outline" : "download-outline"} 
                      size={22} 
                      color={colors.secondary} 
                    />
                  </View>
                  <Text style={styles.optionText}>
                    {isDownloading ? 'Downloading...' : 'Download'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Add to Queue */}
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  onAddToQueue();
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="list-outline" size={22} color={colors.primary} />
                </View>
                <Text style={styles.optionText}>Add to Queue</Text>
              </TouchableOpacity>

              {/* Add to Playlist */}
              {onAddToPlaylist && (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onAddToPlaylist();
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.optionIcon, { backgroundColor: colors.info + '40' }]}>
                    <Ionicons name="add-circle-outline" size={22} color={colors.secondary} />
                  </View>
                  <Text style={styles.optionText}>Add to Playlist</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
  },
  modal: {
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: borderRadius.large,
    borderTopRightRadius: borderRadius.large,
    paddingBottom: spacing.xl,
  },
  songHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  albumArt: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.backgroundTertiary,
  },
  songInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  songTitle: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  songArtist: {
    ...typography.body,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: spacing.lg,
  },
  options: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  optionText: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
  },
  cancelButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.bodyLarge,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
  },
});
