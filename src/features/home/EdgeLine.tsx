import React from 'react';
import { View, StyleSheet } from 'react-native';

type Props = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export function EdgeLine({ x1, y1, x2, y2 }: Props) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  return (
    <View
      style={[
        styles.root,
        {
          left: midX,
          top: midY,
          transform: [{ translateX: -length / 2 }, { rotateZ: `${angle}rad` }],
        },
      ]}
    >
      <View style={[styles.line, { width: length }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    height: 1,
    justifyContent: 'center',
  },
  line: {
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.26)',
  },
});
