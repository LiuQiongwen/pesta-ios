import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/lib/constants';

export default function LoadingView({ label = '加载中...' }: { label?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.accent} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  text: {
    color:       COLORS.textDim,
    fontSize:    13,
    fontFamily:  'monospace',
    letterSpacing: 1,
  },
});
