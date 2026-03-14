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
  Dimensions,
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
    switch (type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={20} color={colors.success} />;
      case 'error':
        return <Ionicons name="close-circle" size={20} color={colors.error} />;
      case 'download':
        return <Ionicons name="download-outline" size={20} color={colors.secondary} />;
      default:
        return <Ionicons name="information-circle" size={20} color={colors.primary} />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return colors.success + '20';
      case 'error':
        return colors.error + '20';
      case 'download':
        return colors.secondary + '20';
      default:
        return colors.primary + '20';
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
      <View style={[styles.toast, { backgroundColor: getBackgroundColor() }]}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>{getIcon()}</View>
          <View style={styles.textContainer}>
            <Text style={styles.message} numberOfLines={1}>
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    paddingVertical: spacing.sm,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: colors.textPrimary,
    lineHeight: 16,
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
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.secondary,
    minWidth: 32,
    textAlign: 'right',
  },
  closeButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
});
