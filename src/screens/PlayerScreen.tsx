import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = StackScreenProps<RootStackParamList, 'Player'>;

export const PlayerScreen: React.FC<Props> = ({ route, navigation }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.closeText}>✕ Close</Text>
      </TouchableOpacity>
      
      <Text style={styles.text}>Player Screen (Modal)</Text>
      {route.params?.song && (
        <Text style={styles.subText}>{route.params.song.name}</Text>
      )}
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
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
  },
  closeText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  text: {
    color: colors.textPrimary,
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
  },
  subText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 8,
  },
});
