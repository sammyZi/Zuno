import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = StackScreenProps<RootStackParamList, 'Artist'>;

export const ArtistScreen: React.FC<Props> = ({ route }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Artist Screen</Text>
      <Text style={styles.subText}>Artist ID: {route.params.artistId}</Text>
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
