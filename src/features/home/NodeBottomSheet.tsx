import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import type { StarNode } from '@/mock/homeNodes';
import { palette } from '@/theme/palette';

type Props = {
  node: StarNode | null;
  onClose: () => void;
};

export function NodeBottomSheet({ node, onClose }: Props) {
  return (
    <Modal visible={Boolean(node)} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <GlassCard style={styles.sheet} elevated>
          <Text style={styles.mark}>Home_Node_Selected</Text>
          <Text style={styles.title}>{node?.title}</Text>
          <Text style={styles.summary}>{node?.summary}</Text>
          <View style={styles.tags}>
            {node?.tags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </GlassCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    margin: 12,
    marginBottom: 18,
    borderRadius: 22,
    backgroundColor: palette.glassStrong,
    gap: 10,
  },
  mark: {
    color: palette.textDim,
    fontSize: 10,
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  title: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
  },
  summary: {
    color: palette.textDim,
    fontSize: 13,
    lineHeight: 20,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  tag: {
    backgroundColor: palette.accentSoft,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: {
    color: palette.accent,
    fontSize: 11,
  },
  button: {
    marginTop: 6,
    borderRadius: 12,
    backgroundColor: palette.accentSoft,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    paddingVertical: 10,
  },
  buttonText: {
    color: palette.text,
    fontWeight: '600',
  },
});
