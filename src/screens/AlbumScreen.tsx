import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = StackScreenProps<RootStackParamList, 'Album'>;

export const AlbumScreen: React.FC<Props> = ({ route }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Album Screen</Text>
      <Text style={styles.subText}>Album ID: {route.params.albumId}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.textPrimary,
    fontSize: 24,
  },
  subText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 8,
  },
});
