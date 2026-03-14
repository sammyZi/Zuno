/**
 * Settings Screen
 * Displays app settings and preferences
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { borderRadius } from '../theme/borderRadius';
import { ConfirmModal } from '../components/common';
import { useSettingsStore, AudioQuality, DownloadPreference } from '../store';
import { DownloadService } from '../services/storage';

const APP_VERSION = '1.0.0';

export const SettingsScreen: React.FC = () => {
  const {
    audioQuality,
    downloadPreference,
    storageUsed,
    setAudioQuality,
    setDownloadPreference,
    updateStorageUsed,
    clearCache,
    loadSettings,
  } = useSettingsStore();

  const [isClearing, setIsClearing] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    updateStorage();
  }, []);

  // Update storage used
  const updateStorage = async () => {
    try {
      const bytes = await DownloadService.getStorageUsed();
      updateStorageUsed(bytes);
    } catch (error) {
      console.error('Error getting storage:', error);
    }
  };

  // Handle audio quality selection
  const handleAudioQualitySelect = (quality: AudioQuality) => {
    setAudioQuality(quality);
  };

  // Handle download preference selection
  const handleDownloadPreferenceSelect = (preference: DownloadPreference) => {
    setDownloadPreference(preference);
  };

  // Handle clear cache
  const handleClearCache = () => {
    setShowClearModal(true);
  };

  const confirmClearCache = async () => {
    setShowClearModal(false);
    setIsClearing(true);
    try {
      await DownloadService.clearAllDownloads();
      await clearCache();
      await updateStorage();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      setIsClearing(false);
    }
  };

  // Format bytes to readable size
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundPrimary} />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Customize your music experience</Text>
        </View>

        {/* Audio Quality Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="musical-notes" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>AUDIO QUALITY</Text>
          </View>
          
          <View style={styles.card}>
            <TouchableOpacity
              style={[styles.settingItem, audioQuality === '96kbps' && styles.settingItemActive]}
              onPress={() => handleAudioQualitySelect('96kbps')}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="musical-note" size={20} color={colors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Standard Quality</Text>
                  <Text style={styles.settingDescription}>96 kbps • Save data</Text>
                </View>
              </View>
              {audioQuality === '96kbps' && (
                <View style={styles.checkmarkContainer}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={[styles.settingItem, audioQuality === '160kbps' && styles.settingItemActive]}
              onPress={() => handleAudioQualitySelect('160kbps')}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="musical-notes" size={20} color={colors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Good Quality</Text>
                  <Text style={styles.settingDescription}>160 kbps • Balanced</Text>
                </View>
              </View>
              {audioQuality === '160kbps' && (
                <View style={styles.checkmarkContainer}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={[styles.settingItem, audioQuality === '320kbps' && styles.settingItemActive]}
              onPress={() => handleAudioQualitySelect('320kbps')}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="headset" size={20} color={colors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>High Quality</Text>
                  <Text style={styles.settingDescription}>320 kbps • Best audio</Text>
                </View>
              </View>
              {audioQuality === '320kbps' && (
                <View style={styles.checkmarkContainer}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Download Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="download" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>DOWNLOADS</Text>
          </View>
          
          <View style={styles.card}>
            <TouchableOpacity
              style={[styles.settingItem, downloadPreference === 'wifi-only' && styles.settingItemActive]}
              onPress={() => handleDownloadPreferenceSelect('wifi-only')}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="wifi" size={20} color={colors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>WiFi Only</Text>
                  <Text style={styles.settingDescription}>Download only on WiFi</Text>
                </View>
              </View>
              {downloadPreference === 'wifi-only' && (
                <View style={styles.checkmarkContainer}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={[styles.settingItem, downloadPreference === 'mobile-allowed' && styles.settingItemActive]}
              onPress={() => handleDownloadPreferenceSelect('mobile-allowed')}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="cellular" size={20} color={colors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Mobile Data Allowed</Text>
                  <Text style={styles.settingDescription}>Download on any connection</Text>
                </View>
              </View>
              {downloadPreference === 'mobile-allowed' && (
                <View style={styles.checkmarkContainer}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Storage Management Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="folder-open" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>STORAGE</Text>
          </View>
          
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="save" size={20} color={colors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Downloaded Songs</Text>
                  <Text style={styles.settingDescription}>{formatBytes(storageUsed)}</Text>
                </View>
              </View>
              <View style={styles.storageIndicator}>
                <Text style={styles.storageText}>{formatBytes(storageUsed)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleClearCache}
              disabled={isClearing}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.textMuted + '20' }]}>
                  <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
                </View>
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, { color: colors.textSecondary }]}>
                    {isClearing ? 'Clearing...' : 'Clear Cache'}
                  </Text>
                  <Text style={styles.settingDescription}>
                    Remove all downloaded songs
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>ABOUT</Text>
          </View>
          
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="phone-portrait-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>App Version</Text>
                  <Text style={styles.settingDescription}>{APP_VERSION}</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="code-slash-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Built With</Text>
                  <Text style={styles.settingDescription}>
                    React Native & Expo
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="musical-note-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Music API</Text>
                  <Text style={styles.settingDescription}>Powered by JioSaavn</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Clear Cache Confirmation Modal */}
      <ConfirmModal
        visible={showClearModal}
        title="Clear Cache"
        message="This will delete all downloaded songs. Are you sure?"
        confirmText="Clear"
        cancelText="Cancel"
        confirmColor={colors.error}
        onConfirm={confirmClearCache}
        onCancel={() => setShowClearModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    paddingTop: StatusBar.currentHeight || 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Space for tab bar + mini player
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitle: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textMuted,
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
    paddingTop:12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.large,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.md,
    minHeight: 72,
  },
  settingItemActive: {
    backgroundColor: colors.backgroundTertiary + '80',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  settingDescription: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Poppins_400Regular',
    color: colors.textMuted,
    lineHeight: 16,
  },
  checkmarkContainer: {
    marginLeft: spacing.sm,
  },
  storageIndicator: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.small,
  },
  storageText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginLeft: spacing.md + 44 + spacing.md, // Align with text
  },
  bottomPadding: {
    height: spacing.xl,
  },
});
