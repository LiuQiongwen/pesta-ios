import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { palette } from '@/theme/palette';
import { getActionData, type ActionData } from '@/features/action/data';

export default function ActionScreen() {
  const [data, setData] = useState<ActionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const next = await getActionData();
        if (alive) setData(next);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Failed to load action data');
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
    <ScreenShell title="Action" subtitle="Task conversion pod with mock lifecycle.">
      {loading && (
        <View style={styles.stateWrap}>
          <ActivityIndicator color={palette.accent} />
          <Text style={styles.stateText}>Loading action data...</Text>
        </View>
      )}
      {!loading && error && <Text style={styles.errorText}>{error}</Text>}
      {!loading && !error && !data && <Text style={styles.stateText}>No action data</Text>}
      {!loading && !error && data && (
      <GlassCard>
        <Text style={styles.label}>Action Items</Text>
        <Text style={styles.source}>Data Source: {data.source.toUpperCase()}</Text>
        {data.items.map(item => (
          <View key={item.id} style={styles.item}>
            <Text style={styles.status}>{item.status}</Text>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        ))}
      </GlassCard>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  label: { color: palette.text, fontWeight: '600', marginBottom: 6 },
  source: { color: palette.textDim, fontSize: 11, fontFamily: 'monospace', marginBottom: 2 },
  item: { flexDirection: 'row', gap: 8, marginTop: 10 },
  status: { color: palette.accent, fontFamily: 'monospace', fontSize: 10, marginTop: 3 },
  text: { color: palette.textDim, fontSize: 14, flex: 1 },
  stateWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stateText: { color: palette.textDim, fontSize: 12, fontFamily: 'monospace' },
  errorText: { color: palette.danger, fontSize: 12 },
});
