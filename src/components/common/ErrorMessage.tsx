import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Button } from './Button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.errorBox}>
        <Ionicons name="alert-circle" size={24} color={colors.textPrimary} />
        <Text style={styles.errorText}>{message}</Text>
      </View>
      {onRetry && (
        <Button
          variant="secondary"
          title="Retry"
          onPress={onRetry}
          style={styles.retryButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  retryButton: {
    marginTop: spacing.md,
  },
});
