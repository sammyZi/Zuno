/**
 * Playlist Selector Modal
 * Premium modal for selecting which playlist to add a song to
 * Features: drag handle, song preview banner, polished list, animated states
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
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { usePlaylistStore, Playlist } from '../../store/playlistStore';
import { Song } from '../../types';
import { getImageUrl, getArtistNames } from '../../utils/audio';

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
      removeSongFromPlaylist(playlist.id, song.id);
    } else {
      addSongToPlaylist(playlist.id, song);
    }
  };

  const imageUrl = song ? getImageUrl(song.image, 'medium') : null;
  const artistNames = song ? getArtistNames(song) : '';

  const renderPlaylistItem = ({ item, index }: { item: Playlist; index: number }) => {
    const isInPlaylist = isSongInPlaylist(item);
    const songCount = item.songs.length;

    return (
      <TouchableOpacity
        style={[styles.playlistItem, isInPlaylist && styles.playlistItemActive]}
        onPress={() => handleTogglePlaylist(item)}
        activeOpacity={0.6}
      >
        {/* Playlist Thumbnail */}
        <View style={[styles.playlistThumb, isInPlaylist && styles.playlistThumbActive]}>
          {item.songs.length > 0 && item.songs[0]?.image ? (
            <Image
              source={{ uri: getImageUrl(item.songs[0].image, 'low') }}
              style={styles.playlistThumbImage}
            />
          ) : (
            <Ionicons
              name="musical-notes"
              size={22}
              color={isInPlaylist ? colors.primary : colors.textMuted}
            />
          )}
          {isInPlaylist && (
            <View style={styles.thumbOverlay}>
              <Ionicons name="checkmark" size={20} color="#fff" />
            </View>
          )}
        </View>

        {/* Playlist Info */}
        <View style={styles.playlistInfo}>
          <Text
            style={[styles.playlistName, isInPlaylist && styles.playlistNameActive]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={styles.playlistMeta}>
            {songCount} {songCount === 1 ? 'song' : 'songs'}
          </Text>
        </View>

        {/* Toggle Indicator */}
        <View style={[styles.toggleBadge, isInPlaylist && styles.toggleBadgeActive]}>
          <Ionicons
            name={isInPlaylist ? 'checkmark' : 'add'}
            size={18}
            color={isInPlaylist ? '#fff' : colors.textMuted}
          />
        </View>
      </TouchableOpacity>
    );
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
              {/* Drag Handle */}
              <View style={styles.handleRow}>
                <View style={styles.handle} />
              </View>

              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Add to Playlist</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Song Preview Banner */}
              {song && (
                <LinearGradient
                  colors={['rgba(255, 140, 40, 0.06)', 'transparent']}
                  style={styles.songBanner}
                >
                  <Image source={{ uri: imageUrl ?? undefined }} style={styles.songBannerArt} />
                  <View style={styles.songBannerInfo}>
                    <Text style={styles.songBannerTitle} numberOfLines={1}>
                      {song.name}
                    </Text>
                    <Text style={styles.songBannerArtist} numberOfLines={1}>
                      {artistNames}
                    </Text>
                  </View>
                </LinearGradient>
              )}

              {/* Create New Playlist Button */}
              {!showCreateInput && (
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => setShowCreateInput(true)}
                  activeOpacity={0.6}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.createIconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="add" size={20} color="#fff" />
                  </LinearGradient>
                  <View style={styles.createTextContainer}>
                    <Text style={styles.createButtonText}>New Playlist</Text>
                    <Text style={styles.createButtonSubtext}>Start a new collection</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ opacity: 0.4 }} />
                </TouchableOpacity>
              )}

              {/* Create Playlist Input */}
              {showCreateInput && (
                <View style={styles.createInputContainer}>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="musical-notes-outline" size={18} color={colors.primary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Playlist name..."
                      placeholderTextColor={'rgba(255, 255, 255, 0.25)'}
                      value={newPlaylistName}
                      onChangeText={setNewPlaylistName}
                      autoFocus
                      maxLength={50}
                      selectionColor={colors.primary}
                    />
                    {newPlaylistName.length > 0 && (
                      <TouchableOpacity onPress={() => setNewPlaylistName('')}>
                        <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.inputFooter}>
                    <Text style={styles.inputHint}>
                      {newPlaylistName.length}/50
                    </Text>
                    <View style={styles.createActions}>
                      <TouchableOpacity
                        style={styles.createActionCancel}
                        onPress={() => {
                          setShowCreateInput(false);
                          setNewPlaylistName('');
                        }}
                      >
                        <Text style={styles.createCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.createActionPrimary,
                          !newPlaylistName.trim() && styles.createActionDisabled,
                        ]}
                        onPress={handleCreatePlaylist}
                        disabled={!newPlaylistName.trim()}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={newPlaylistName.trim() ? '#fff' : colors.textMuted}
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          style={[
                            styles.createPrimaryText,
                            !newPlaylistName.trim() && styles.createPrimaryTextDisabled,
                          ]}
                        >
                          Create
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {/* Divider */}
              {playlists.length > 0 && <View style={styles.sectionDivider} />}

              {/* Section Label */}
              {playlists.length > 0 && (
                <View style={styles.sectionLabelRow}>
                  <Text style={styles.sectionLabel}>Your Playlists</Text>
                  <Text style={styles.sectionCount}>{playlists.length}</Text>
                </View>
              )}

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
                    <View style={styles.emptyIconCircle}>
                      <Ionicons name="albums-outline" size={36} color={colors.textMuted} />
                    </View>
                    <Text style={styles.emptyText}>No playlists yet</Text>
                    <Text style={styles.emptySubtext}>
                      Tap "New Playlist" above to create your first collection
                    </Text>
                  </View>
                )
              )}

              {/* Done Button */}
              <View style={styles.doneButtonContainer}>
                <TouchableOpacity style={styles.doneButton} onPress={onClose} activeOpacity={0.8}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.large,
    width: '90%',
    maxWidth: 450,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },

  // ─── Header ──────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ─── Song Banner ─────────────────────────────
  songBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.sm,
  },
  songBannerArt: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.small,
    marginRight: spacing.md,
  },
  songBannerInfo: {
    flex: 1,
  },
  songBannerTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  songBannerArtist: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
  },

  // ─── Create Button ───────────────────────────
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.medium,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderStyle: 'dashed',
  },
  createIconGradient: {
    width: 36,
    height: 36,
    borderRadius: 10,
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
    marginBottom: 1,
  },
  createButtonSubtext: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
  },

  // ─── Create Input ────────────────────────────
  createInputContainer: {
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    backgroundColor: 'rgba(255, 140, 40, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 40, 0.15)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.medium,
    borderWidth: 2,
    borderColor: 'rgba(255, 140, 40, 0.3)',
    minHeight: 48,
  },
  inputIcon: {
    marginLeft: spacing.md,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingRight: spacing.md,
  },
  inputFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm + 2,
  },
  inputHint: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255, 255, 255, 0.25)',
  },
  createActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  createActionCancel: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.small,
  },
  createCancelText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: colors.textMuted,
  },
  createActionPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.small,
    backgroundColor: colors.primary,
  },
  createActionDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  createPrimaryText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  createPrimaryTextDisabled: {
    color: colors.textMuted,
  },

  // ─── Section ─────────────────────────────────
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionCount: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: colors.textMuted,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },

  // ─── Playlist List ───────────────────────────
  list: {
    maxHeight: 300,
  },
  listContent: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: borderRadius.medium,
    marginVertical: 2,
  },
  playlistItemActive: {
    backgroundColor: 'rgba(255, 140, 40, 0.06)',
  },

  // Playlist Thumbnail
  playlistThumb: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.small,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  playlistThumbActive: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 140, 40, 0.35)',
  },
  playlistThumbImage: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.small,
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 140, 40, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Playlist Info
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  playlistNameActive: {
    color: colors.primary,
    fontFamily: 'Poppins_600SemiBold',
  },
  playlistMeta: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
  },

  // Toggle Badge
  toggleBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  toggleBadgeActive: {
    backgroundColor: colors.primary,
  },

  // ─── Empty State ─────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl + spacing.md,
    paddingHorizontal: spacing.xl,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },

  // ─── Done Button ─────────────────────────────
  doneButtonContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
  },
  doneButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
});
