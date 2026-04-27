import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { palette } from '@/theme/palette';
import { getMemoryData, type MemoryData } from '@/features/memory/data';

export default function MemoryScreen() {
  const [data, setData] = useState<MemoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const next = await getMemoryData();
        if (alive) setData(next);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Failed to load memory data');
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <ScreenShell title="Memory" subtitle="Flashcard and spaced review UI with mock schedule.">
      {loading && (
        <View style={styles.stateWrap}>
          <ActivityIndicator color={palette.accent} />
          <Text style={styles.stateText}>Loading memory data...</Text>
        </View>
      )}
      {!loading && error && <Text style={styles.errorText}>{error}</Text>}
      {!loading && !error && !data && <Text style={styles.stateText}>No memory data</Text>}
      {!loading && !error && data && (
      <GlassCard elevated>
        <Text style={styles.label}>Card Front</Text>
        <Text style={styles.source}>
          Data Source: {data.source.toUpperCase()} · Queue {data.queueSize}
        </Text>
        <Text style={styles.cardText}>{data.current.question}</Text>
        <View style={styles.actions}>
          <Text style={styles.btn}>Again</Text>
          <Text style={styles.btn}>Hard</Text>
          <Text style={styles.btn}>Good</Text>
          <Text style={styles.btn}>Easy</Text>
        </View>
      </GlassCard>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  label: { color: palette.textDim, fontSize: 11, fontFamily: 'monospace' },
  source: { color: palette.textDim, fontSize: 11, fontFamily: 'monospace', marginTop: 4 },
  cardText: { color: palette.text, marginTop: 10, fontSize: 17, lineHeight: 25 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  btn: {
    color: palette.text,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    overflow: 'hidden',
  },
  stateWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stateText: { color: palette.textDim, fontSize: 12, fontFamily: 'monospace' },
  errorText: { color: palette.danger, fontSize: 12 },
});
