/**
 * Playlist Selector Modal
 * Modal for selecting which playlist to add a song to
 * Industry standard: Shows checkmarks for playlists containing the song, allows toggle
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { usePlaylistStore, Playlist } from '../../store/playlistStore';
import { Song } from '../../types';

interface PlaylistSelectorModalProps {
  visible: boolean;
  song: Song | null;
  onClose: () => void;
}

export const PlaylistSelectorModal: React.FC<PlaylistSelectorModalProps> = ({
  visible,
  song,
  onClose,
}) => {
  const { playlists, createPlaylist, addSongToPlaylist, removeSongFromPlaylist } = usePlaylistStore();
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowCreateInput(false);
    }
  };

  const isSongInPlaylist = (playlist: Playlist): boolean => {
    if (!song) return false;
    return playlist.songs.some((s) => s.id === song.id);
  };

  const handleTogglePlaylist = (playlist: Playlist) => {
    if (!song) return;

    if (isSongInPlaylist(playlist)) {
      // Remove from playlist
      removeSongFromPlaylist(playlist.id, song.id);
    } else {
      // Add to playlist
      addSongToPlaylist(playlist.id, song);
    }
  };

  const renderPlaylistItem = ({ item }: { item: Playlist }) => {
    const isInPlaylist = isSongInPlaylist(item);

    return (
      <TouchableOpacity
        style={[styles.playlistItem, isInPlaylist && styles.playlistItemActive]}
        onPress={() => handleTogglePlaylist(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.playlistIcon, isInPlaylist && styles.playlistIconActive]}>
          <Ionicons 
            name={isInPlaylist ? "musical-notes" : "musical-notes-outline"} 
            size={22} 
            color={isInPlaylist ? colors.primary : colors.textMuted} 
          />
        </View>
        <View style={styles.playlistInfo}>
          <Text style={[styles.playlistName, isInPlaylist && styles.playlistNameActive]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.playlistCount}>
            {item.songs.length} {item.songs.length === 1 ? 'song' : 'songs'}
          </Text>
        </View>
        {isInPlaylist ? (
          <View style={styles.checkmarkContainer}>
            <Ionicons name="checkmark-circle" size={26} color={colors.primary} />
          </View>
        ) : (
          <View style={styles.addIconContainer}>
            <Ionicons name="add-circle-outline" size={26} color={colors.textMuted} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Add to Playlist</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Create New Playlist Button */}
              {!showCreateInput && (
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => setShowCreateInput(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.createIconContainer}>
                    <Ionicons name="add" size={22} color={colors.primary} />
                  </View>
                  <View style={styles.createTextContainer}>
                    <Text style={styles.createButtonText}>Create New Playlist</Text>
                    <Text style={styles.createButtonSubtext}>Start fresh with a new collection</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              )}

              {/* Create Playlist Input */}
              {showCreateInput && (
                <View style={styles.createInputContainer}>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="musical-notes-outline" size={20} color={colors.primary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter playlist name"
                      placeholderTextColor={colors.textMuted}
                      value={newPlaylistName}
                      onChangeText={setNewPlaylistName}
                      autoFocus
                      maxLength={50}
                    />
                  </View>
                  <Text style={styles.inputHint}>
                    {newPlaylistName.length}/50 characters
                  </Text>
                  <View style={styles.createActions}>
                    <TouchableOpacity
                      style={styles.createActionButton}
                      onPress={() => {
                        setShowCreateInput(false);
                        setNewPlaylistName('');
                      }}
                    >
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.createActionButton,
                        styles.createActionButtonPrimary,
                        !newPlaylistName.trim() && styles.createActionButtonDisabled,
                      ]}
                      onPress={handleCreatePlaylist}
                      disabled={!newPlaylistName.trim()}
                    >
                      <Ionicons 
                        name="checkmark-circle" 
                        size={18} 
                        color={newPlaylistName.trim() ? colors.backgroundPrimary : colors.textMuted} 
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[
                        styles.createText,
                        !newPlaylistName.trim() && styles.createTextDisabled,
                      ]}>
                        Create
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Divider */}
              {playlists.length > 0 && <View style={styles.divider} />}

              {/* Playlists List */}
              {playlists.length > 0 ? (
                <FlatList
                  data={playlists}
                  renderItem={renderPlaylistItem}
                  keyExtractor={(item) => item.id}
                  style={styles.list}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                !showCreateInput && (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="albums-outline" size={48} color={colors.textMuted} />
                    <Text style={styles.emptyText}>No playlists yet</Text>
                    <Text style={styles.emptySubtext}>Create your first playlist to get started</Text>
                  </View>
                )
              )}

              {/* Done Button */}
              <View style={styles.doneButtonContainer}>
                <TouchableOpacity style={styles.doneButton} onPress={onClose} activeOpacity={0.8}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.backgroundPrimary} style={{ marginRight: 6 }} />
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
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
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingTop: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: colors.textPrimary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  createIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.medium,
    backgroundColor: 'rgba(255, 140, 40, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  createTextContainer: {
    flex: 1,
  },
  createButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  createButtonSubtext: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
  },
  createInputContainer: {
    padding: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(255, 140, 40, 0.03)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.medium,
    borderWidth: 2,
    borderColor: 'rgba(255, 140, 40, 0.3)',
    paddingHorizontal: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    padding: spacing.md,
    color: colors.textPrimary,
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
  },
  inputHint: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  createActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  createActionButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.medium,
    flexDirection: 'row',
    alignItems: 'center',
  },
  createActionButtonPrimary: {
    backgroundColor: colors.primary,
  },
  createActionButtonDisabled: {
    backgroundColor: colors.backgroundTertiary,
    opacity: 0.5,
  },
  cancelText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textMuted,
  },
  createText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.backgroundPrimary,
  },
  createTextDisabled: {
    color: colors.textMuted,
  },
  divider: {
    height: 8,
    backgroundColor: colors.backgroundPrimary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: spacing.xs,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  playlistItemActive: {
    backgroundColor: 'rgba(255, 140, 40, 0.05)',
  },
  playlistIcon: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.medium,
    backgroundColor: 'rgba(255, 140, 40, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  playlistIconActive: {
    backgroundColor: 'rgba(255, 140, 40, 0.2)',
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  playlistNameActive: {
    color: colors.primary,
  },
  playlistCount: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
  },
  checkmarkContainer: {
    marginLeft: spacing.sm,
  },
  addIconContainer: {
    opacity: 0.4,
    marginLeft: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  doneButtonContainer: {
    padding: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
  },
  doneButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.backgroundPrimary,
  },
});
