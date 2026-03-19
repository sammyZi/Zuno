/**
 * Toast Component
 * Shows temporary notifications with progress - compact design with stacking
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

const TOAST_WIDTH = 200;
const TOAST_HEIGHT = 56;
const STACK_OFFSET = 8;

export type ToastType = 'success' | 'error' | 'info' | 'download';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  progress?: number; // 0-100 for download progress
  onClose?: () => void;
  duration?: number; // Auto-hide duration in ms (0 = no auto-hide)
  index?: number; // For stacking multiple toasts
  totalCount?: number; // Total number of toasts for counter
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  progress,
  onClose,
  duration = 3000,
  index = 0,
  totalCount = 1,
}) => {
  const translateX = useRef(new Animated.Value(300)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Show toast with slide-in from right
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          tension: 80,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: index === 0 ? 1 : 0.7 - index * 0.15,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1 - index * 0.05,
          tension: 80,
          friction: 12,
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
  }, [visible, index]);

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
    const iconSize = 18;
    const accentColor = getAccentColor();
    switch (type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={iconSize} color={accentColor} />;
      case 'error':
        return <Ionicons name="close-circle" size={iconSize} color={accentColor} />;
      case 'download':
        return <Ionicons name="arrow-down-circle" size={iconSize} color={accentColor} />;
      default:
        return <Ionicons name="information-circle" size={iconSize} color={accentColor} />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'rgba(26, 77, 46, 0.95)'; // Dark green with transparency
      case 'error':
        return 'rgba(77, 26, 26, 0.95)'; // Dark red with transparency
      case 'download':
        return 'rgba(26, 61, 77, 0.95)'; // Dark blue with transparency
      default:
        return 'rgba(77, 58, 26, 0.95)'; // Dark orange with transparency
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'rgba(74, 222, 128, 0.3)';
      case 'error':
        return 'rgba(248, 113, 113, 0.3)';
      case 'download':
        return 'rgba(96, 165, 250, 0.3)';
      default:
        return 'rgba(251, 146, 60, 0.3)';
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

  const showCounter = totalCount > 1 && index === 0;
  const isStacked = index > 0;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: 60 + index * STACK_OFFSET,
          transform: [
            { translateX },
            { scale },
            { translateY: index * -2 },
          ],
          opacity,
          zIndex: 9999 - index,
        },
      ]}
      pointerEvents={index === 0 ? 'auto' : 'none'}
    >
      <View style={[
        styles.toast, 
        { 
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        }
      ]}>
        {/* Progress bar background */}
        {type === 'download' && progress !== undefined && (
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                { 
                  width: `${progress}%`,
                  backgroundColor: getAccentColor(),
                }
              ]}
            />
          </View>
        )}
        
        <View style={styles.content}>
          <View style={styles.iconContainer}>{getIcon()}</View>
          
          <View style={styles.textContainer}>
            <Text style={[styles.message, { color: colors.textPrimary }]} numberOfLines={1}>
              {message}
            </Text>
            {type === 'download' && progress !== undefined && (
              <Text style={[styles.progressText, { color: getAccentColor() }]}>
                {Math.round(progress)}%
              </Text>
            )}
          </View>

          {showCounter && (
            <View style={[styles.counter, { backgroundColor: getAccentColor() }]}>
              <Text style={styles.counterText}>{totalCount}</Text>
            </View>
          )}
          
          {onClose && index === 0 && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={hideToast}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={14} color={colors.textMuted} />
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
    height: TOAST_HEIGHT,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.backgroundSecondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
  progressBarBg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    height: '100%',
  },
  iconContainer: {
    marginRight: spacing.xs,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
    lineHeight: 16,
  },
  progressText: {
    fontSize: 10,
    fontFamily: 'Poppins_700Bold',
    marginTop: 2,
    lineHeight: 12,
  },
  counter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
  },
  counterText: {
    fontSize: 11,
    fontFamily: 'Poppins_700Bold',
    color: colors.backgroundPrimary,
  },
  closeButton: {
    padding: 4,
  },
});
