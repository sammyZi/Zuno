/**
 * Song Options Modal
 * Bottom sheet modal for song actions (Add to Queue, etc.)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Song } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { getImageUrl, getArtistNames } from '../../utils/audio';

interface SongOptionsModalProps {
  visible: boolean;
  song: Song | null;
  onClose: () => void;
  onAddToQueue: () => void;
}

export const SongOptionsModal: React.FC<SongOptionsModalProps> = ({
  visible,
  song,
  onClose,
  onAddToQueue,
}) => {
  if (!song) return null;

  const imageUrl = getImageUrl(song.image, 'medium');
  const artistNames = getArtistNames(song);

  const handleAddToQueue = () => {
    onAddToQueue();
    onClose();
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
              {/* Song Info Header */}
              <View style={styles.header}>
                <Image source={{ uri: imageUrl }} style={styles.albumArt} />
                <View style={styles.songInfo}>
                  <Text style={styles.songTitle} numberOfLines={1}>
                    {song.name}
                  </Text>
                  <Text style={styles.artistName} numberOfLines={1}>
                    {artistNames}
                  </Text>
                </View>
              </View>

              {/* Options */}
              <View style={styles.options}>
                <TouchableOpacity style={styles.option} onPress={handleAddToQueue}>
                  <Ionicons name="add-circle-outline" size={24} color={colors.textPrimary} />
                  <Text style={styles.optionText}>Add to Queue</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={onClose}>
                  <Ionicons name="heart-outline" size={24} color={colors.textPrimary} />
                  <Text style={styles.optionText}>Add to Favorites</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={onClose}>
                  <Ionicons name="share-outline" size={24} color={colors.textPrimary} />
                  <Text style={styles.optionText}>Share</Text>
                </TouchableOpacity>
              </View>

              {/* Cancel Button */}
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: borderRadius.large,
    borderTopRightRadius: borderRadius.large,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  albumArt: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.medium,
    marginRight: spacing.md,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    ...typography.bodyLarge,
    marginBottom: spacing.xs,
  },
  artistName: {
    ...typography.body,
    color: colors.textMuted,
  },
  options: {
    paddingVertical: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  optionText: {
    ...typography.body,
    marginLeft: spacing.md,
  },
  cancelButton: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
  },
  cancelText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
