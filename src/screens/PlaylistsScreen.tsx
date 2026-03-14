/**
 * Playlists Screen
 * Displays user's playlists
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme';
import { usePlaylistStore, Playlist } from '../store/playlistStore';

export const PlaylistsScreen: React.FC = () => {
  const { playlists, createPlaylist, deletePlaylist } = usePlaylistStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowCreateModal(false);
    }
  };

  const renderPlaylistItem = ({ item }: { item: Playlist }) => (
    <TouchableOpacity style={styles.playlistCard}>
      <View style={styles.playlistIcon}>
        <Ionicons name="musical-notes" size={32} color={colors.primary} />
      </View>
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.playlistCount}>
          {item.songs.length} {item.songs.length === 1 ? 'song' : 'songs'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deletePlaylist(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color={colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundPrimary} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Playlists</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Playlists List or Empty State */}
      {playlists.length > 0 ? (
        <FlatList
          data={playlists}
          renderItem={renderPlaylistItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Ionicons name="albums-outline" size={64} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No Playlists Yet</Text>
          <Text style={styles.emptySubtitle}>
            Create your first playlist and start adding your favorite tracks.
          </Text>
        </View>
      )}

      {/* Create Playlist Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={() => setShowCreateModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                {/* Icon */}
                <View style={styles.modalIconContainer}>
                  <View style={styles.modalIconBg}>
                    <Ionicons name="musical-notes" size={32} color={colors.primary} />
                  </View>
                </View>

                {/* Title */}
                <Text style={styles.modalTitle}>Create Playlist</Text>
                <Text style={styles.modalSubtitle}>
                  Give your playlist a name to get started
                </Text>

                {/* Input */}
                <TextInput
                  style={styles.input}
                  placeholder="My Awesome Playlist"
                  placeholderTextColor={colors.textMuted}
                  value={newPlaylistName}
                  onChangeText={setNewPlaylistName}
                  autoFocus
                  maxLength={50}
                />
                <Text style={styles.charCount}>
                  {newPlaylistName.length}/50
                </Text>

                {/* Actions */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelModalButton]}
                    onPress={() => {
                      setShowCreateModal(false);
                      setNewPlaylistName('');
                    }}
                  >
                    <Text style={styles.cancelModalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.createModalButton,
                      !newPlaylistName.trim() && styles.createModalButtonDisabled,
                    ]}
                    onPress={handleCreatePlaylist}
                    disabled={!newPlaylistName.trim()}
                  >
                    <Ionicons 
                      name="checkmark" 
                      size={18} 
                      color={newPlaylistName.trim() ? colors.backgroundPrimary : colors.textMuted} 
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[
                      styles.createModalButtonText,
                      !newPlaylistName.trim() && styles.createModalButtonTextDisabled,
                    ]}>
                      Create
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    paddingVertical: spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: colors.textPrimary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(255, 140, 40, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  playlistIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.medium,
    backgroundColor: 'rgba(255, 140, 40, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  playlistCount: {
    ...typography.caption,
    color: colors.textMuted,
  },
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  emptyIconBg: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(255, 140, 40, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalIconContainer: {
    marginBottom: spacing.md,
  },
  modalIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 140, 40, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
    marginBottom: spacing.lg,
    textAlign: 'center',
    lineHeight: 18,
  },
  input: {
    width: '100%',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    color: colors.textPrimary,
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 140, 40, 0.3)',
    textAlign: 'center',
  },
  charCount: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    alignSelf: 'flex-end',
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cancelModalButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.textMuted,
  },
  cancelModalButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textMuted,
  },
  createModalButton: {
    backgroundColor: colors.primary,
  },
  createModalButtonDisabled: {
    backgroundColor: colors.backgroundTertiary,
    opacity: 0.5,
  },
  createModalButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.backgroundPrimary,
  },
  createModalButtonTextDisabled: {
    color: colors.textMuted,
  },
});
