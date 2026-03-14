/**
 * Toast Component
 * Shows temporary notifications with progress
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';

const TOAST_WIDTH = 280;

export type ToastType = 'success' | 'error' | 'info' | 'download';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  progress?: number; // 0-100 for download progress
  onClose?: () => void;
  duration?: number; // Auto-hide duration in ms (0 = no auto-hide)
  index?: number; // For stacking multiple toasts
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  progress,
  onClose,
  duration = 3000,
  index = 0,
}) => {
  const translateX = useRef(new Animated.Value(300)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show toast with slide-in from right
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after duration (if not a download toast with progress)
      if (duration > 0 && type !== 'download') {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.();
    });
  };

  const getIcon = () => {
    const accentColor = getAccentColor();
    switch (type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={20} color={accentColor} />;
      case 'error':
        return <Ionicons name="close-circle" size={20} color={accentColor} />;
      case 'download':
        return <Ionicons name="download-outline" size={20} color={accentColor} />;
      default:
        return <Ionicons name="information-circle" size={20} color={accentColor} />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#1a4d2e'; // Dark green background
      case 'error':
        return '#4d1a1a'; // Dark red background
      case 'download':
        return '#1a3d4d'; // Dark blue background
      default:
        return '#4d3a1a'; // Dark orange background
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'download':
        return colors.secondary;
      default:
        return colors.primary;
    }
  };

  const getAccentColor = () => {
    switch (type) {
      case 'success':
        return '#4ade80'; // Light green
      case 'error':
        return '#f87171'; // Light red
      case 'download':
        return '#60a5fa'; // Light blue
      default:
        return '#fb923c'; // Light orange
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: 60 + index * 90, // Stack toasts vertically
          transform: [{ translateX }],
          opacity,
        },
      ]}
    >
      <View style={[
        styles.toast, 
        { 
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        }
      ]}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>{getIcon()}</View>
          <View style={styles.textContainer}>
            <Text style={[styles.message, { color: getAccentColor() }]} numberOfLines={1}>
              {message}
            </Text>
            {type === 'download' && progress !== undefined && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progress}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
              </View>
            )}
          </View>
          {onClose && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={hideToast}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: spacing.md,
    zIndex: 9999,
  },
  toast: {
    width: TOAST_WIDTH,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.backgroundSecondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    fontFamily: 'Poppins_700Bold',
    color: '#60a5fa',
    minWidth: 32,
    textAlign: 'right',
  },
  closeButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
});
