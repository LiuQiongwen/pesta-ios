import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import type { StarNode } from '@/mock/homeNodes';

type Props = {
  node: StarNode;
  color: string;
  onPress: () => void;
};

export function NodeChip({ node, color, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.node, { left: node.x, top: node.y, borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  node: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
