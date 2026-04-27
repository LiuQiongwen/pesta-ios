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
  return (
    <View
      style={[
        styles.line,
        {
          width: length,
          left: x1,
          top: y1,
          transform: [{ rotateZ: `${angle}rad` }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.26)',
  },
});
