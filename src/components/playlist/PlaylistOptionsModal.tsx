/**
 * Playlist Options Modal
 * Modal for playlist actions: rename, delete, share
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

interface PlaylistOptionsModalProps {
  visible: boolean;
  playlistName: string;
  onClose: () => void;
  onRename: (newName: string) => void;
  onDelete: () => void;
  onShare: () => void;
}

const OPTION_ITEMS = [
  {
    key: 'rename',
    icon: 'create-outline' as const,
    label: 'Rename Playlist',
    subtitle: 'Change the name',
    iconBg: 'rgba(255, 140, 40, 0.12)',
    iconColor: colors.primary,
  },
  {
    key: 'share',
    icon: 'share-outline' as const,
    label: 'Share Playlist',
    subtitle: 'Send to a friend',
    iconBg: 'rgba(100, 140, 255, 0.12)',
    iconColor: '#648CFF',
  },
  {
    key: 'delete',
    icon: 'trash-outline' as const,
    label: 'Delete Playlist',
    subtitle: 'Remove permanently',
    iconBg: 'rgba(255, 75, 110, 0.12)',
    iconColor: '#FF4B6E',
  },
];

export const PlaylistOptionsModal: React.FC<PlaylistOptionsModalProps> = ({
  visible,
  playlistName,
  onClose,
  onRename,
  onDelete,
  onShare,
}) => {
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newName, setNewName] = useState('');

  const handleOptionPress = (key: string) => {
    switch (key) {
      case 'rename':
        setNewName(playlistName);
        setShowRenameModal(true);
        break;
      case 'share':
        onShare();
        onClose();
        break;
      case 'delete':
        onClose();
        Alert.alert(
          'Delete Playlist',
          `Are you sure you want to delete "${playlistName}"? This action cannot be undone.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: onDelete,
            },
          ]
        );
        break;
    }
  };

  const handleRenameSubmit = () => {
    const trimmedName = newName.trim();
    if (trimmedName && trimmedName !== playlistName) {
      onRename(trimmedName);
    }
    setShowRenameModal(false);
    onClose();
  };

  return (
    <>
      {/* Main Options Modal */}
      <Modal
        visible={visible && !showRenameModal}
        transparent
        animationType="fade"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.container}>
                {/* Header with Gradient */}
                <LinearGradient
                  colors={['rgba(255, 140, 40, 0.08)', 'transparent']}
                  style={styles.headerGradient}
                >
                  <View style={styles.header}>
                    <View style={styles.playlistIconBg}>
                      <Ionicons name="musical-notes" size={28} color={colors.primary} />
                    </View>
                    <View style={styles.playlistInfo}>
                      <Text style={styles.playlistTitle} numberOfLines={2}>
                        {playlistName}
                      </Text>
                      <Text style={styles.playlistSubtitle}>Playlist Options</Text>
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
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={colors.textMuted}
                        style={{ opacity: 0.4 }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Cancel Button */}
                <View style={styles.cancelContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onClose}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Rename Modal */}
      <Modal
        visible={showRenameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRenameModal(false)}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={() => setShowRenameModal(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.renameContainer}>
                <View style={styles.renameHeader}>
                  <Ionicons name="create-outline" size={24} color={colors.primary} />
                  <Text style={styles.renameTitle}>Rename Playlist</Text>
                </View>

                <TextInput
                  style={styles.renameInput}
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Enter playlist name"
                  placeholderTextColor={colors.textMuted}
                  autoFocus
                  maxLength={50}
                  returnKeyType="done"
                  onSubmitEditing={handleRenameSubmit}
                />

                <View style={styles.renameButtons}>
                  <TouchableOpacity
                    style={styles.renameCancelButton}
                    onPress={() => setShowRenameModal(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.renameCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.renameSaveButton,
                      !newName.trim() && styles.renameSaveButtonDisabled,
                    ]}
                    onPress={handleRenameSubmit}
                    activeOpacity={0.7}
                    disabled={!newName.trim()}
                  >
                    <Text style={styles.renameSaveText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  container: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
  },
  headerGradient: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playlistIconBg: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.medium,
    backgroundColor: 'rgba(255, 140, 40, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistTitle: {
    fontSize: 17,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
    lineHeight: 23,
    marginBottom: 3,
  },
  playlistSubtitle: {
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
  optionLast: {},
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
    paddingBottom: spacing.lg,
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
  // Rename Modal Styles
  renameContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  renameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  renameTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  renameInput: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 140, 40, 0.3)',
  },
  renameButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  renameCancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  renameCancelText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.primary,
  },
  renameSaveButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
  },
  renameSaveButtonDisabled: {
    opacity: 0.5,
  },
  renameSaveText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.backgroundPrimary,
  },
});
