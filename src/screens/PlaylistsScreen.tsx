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
  Pressable,
  FlatList,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, SlideInDown } from 'react-native-reanimated';
import type { StackScreenProps } from '@react-navigation/stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../theme';
import { usePlaylistStore, Playlist } from '../store/playlistStore';
import type { RootStackParamList, TabParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Playlists'>,
  StackScreenProps<RootStackParamList>
>;

export const PlaylistsScreen: React.FC<Props> = ({ navigation }) => {
  const { playlists, createPlaylist } = usePlaylistStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowCreateModal(false);
    }
  };

  const handleOpenPlaylist = (playlist: Playlist) => {
    navigation.navigate('PlaylistDetail', { playlistId: playlist.id });
  };

  const renderPlaylistItem = ({ item }: { item: Playlist }) => (
    <Pressable 
      style={styles.playlistCard}
      onPress={() => handleOpenPlaylist(item)}
      
    >
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
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundPrimary} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Playlists</Text>
        <Pressable 
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </Pressable>
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
              <Animated.View 
                entering={SlideInDown.duration(300).springify()}
                style={styles.modalContainer}
              >
                {/* Close Button */}
                <Pressable
                  style={styles.closeButton}
                  onPress={() => {
                    setShowCreateModal(false);
                    setNewPlaylistName('');
                  }}
                  
                >
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </Pressable>

                  {/* Icon with Gradient */}
                  <View style={styles.modalIconContainer}>
                    <LinearGradient
                      colors={[colors.primary, '#FF6B35']}
                      style={styles.modalIconBg}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name="albums" size={36} color={colors.backgroundPrimary} />
                    </LinearGradient>
                  </View>

                  {/* Title */}
                  <Text style={styles.modalTitle}>Create New Playlist</Text>
                  <Text style={styles.modalSubtitle}>
                    Give your playlist a unique name
                  </Text>

                  {/* Input Container */}
                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <Ionicons 
                        name="musical-note-outline" 
                        size={20} 
                        color={colors.textMuted} 
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="e.g., Workout Mix, Chill Vibes..."
                        placeholderTextColor={colors.textMuted}
                        value={newPlaylistName}
                        onChangeText={setNewPlaylistName}
                        autoFocus
                        maxLength={50}
                      />
                      {newPlaylistName.length > 0 && (
                        <Pressable
                          onPress={() => setNewPlaylistName('')}
                          style={styles.clearButton}
                        >
                          <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                        </Pressable>
                      )}
                    </View>
                    <View style={styles.inputFooter}>
                      <Text style={styles.inputHint}>
                        <Ionicons name="information-circle-outline" size={12} color={colors.textMuted} />
                        {' '}Choose a memorable name
                      </Text>
                      <Text style={styles.charCount}>
                        {newPlaylistName.length}/50
                      </Text>
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.modalActions}>
                    <Pressable
                      style={[styles.modalButton, styles.cancelModalButton]}
                      onPress={() => {
                        setShowCreateModal(false);
                        setNewPlaylistName('');
                      }}
                      
                    >
                      <Text style={styles.cancelModalButtonText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.modalButton,
                        styles.createModalButton,
                        !newPlaylistName.trim() && styles.createModalButtonDisabled,
                      ]}
                      onPress={handleCreatePlaylist}
                      disabled={!newPlaylistName.trim()}
                      
                    >
                      <LinearGradient
                        colors={
                          newPlaylistName.trim()
                            ? [colors.primary, '#FF6B35']
                            : [colors.backgroundTertiary, colors.backgroundTertiary]
                        }
                        style={styles.createButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Ionicons 
                          name="add-circle" 
                          size={20} 
                          color={newPlaylistName.trim() ? colors.backgroundPrimary : colors.textMuted} 
                          style={{ marginRight: 6 }}
                        />
                        <Text style={[
                          styles.createModalButtonText,
                          !newPlaylistName.trim() && styles.createModalButtonTextDisabled,
                        ]}>
                          Create
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                </Animated.View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xlarge,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 420,
    position: 'relative',
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: borderRadius.round,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalIconContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalIconBg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
    marginBottom: spacing.xl,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.medium,
    borderWidth: 2,
    borderColor: 'rgba(255, 140, 40, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    paddingVertical: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  inputHint: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
  },
  charCount: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textMuted,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    height: 52,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cancelModalButton: {
    backgroundColor: colors.backgroundTertiary,
    borderWidth: 1.5,
    borderColor: colors.textMuted + '40',
  },
  cancelModalButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textSecondary,
  },
  createModalButton: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createModalButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  createButtonGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  createModalButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    color: colors.backgroundPrimary,
  },
  createModalButtonTextDisabled: {
    color: colors.textMuted,
  },
});

