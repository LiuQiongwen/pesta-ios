import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { palette } from '@/theme/palette';
import type { StarNode } from '@/mock/homeNodes';
import { NodeChip } from './NodeChip';
import { EdgeLine } from './EdgeLine';

type Props = {
  nodes: StarNode[];
  onPressNode: (node: StarNode) => void;
};

const typeColor: Record<StarNode['type'], string> = {
  idea: '#93C5FD',
  url: '#C4B5FD',
  image: '#86EFAC',
  task: '#FCA5A5',
};

export function StarMapCanvas({ nodes, onPressNode }: Props) {
  return (
    <GlassCard style={styles.wrap} elevated>
      <Text style={styles.title}>Home_Default</Text>
      <View style={styles.canvas}>
        {nodes.slice(0, -1).map((node, i) => {
          const next = nodes[i + 1];
          return (
            <EdgeLine
              key={`${node.id}-${next.id}`}
              x1={node.x + 11}
              y1={node.y + 11}
              x2={next.x + 11}
              y2={next.y + 11}
            />
          );
        })}
        {nodes.map(node => (
          <NodeChip
            key={node.id}
            node={node}
            color={typeColor[node.type]}
            onPress={() => onPressNode(node)}
          />
        ))}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 340,
    padding: 16,
    overflow: 'hidden',
    backgroundColor: palette.glassStrong,
  },
  title: {
    color: palette.textDim,
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  canvas: {
    flex: 1,
    minHeight: 280,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
});
