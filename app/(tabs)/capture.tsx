import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, View, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { palette } from '@/theme/palette';
import { getCaptureData, type CaptureData } from '@/features/capture/data';

export default function CaptureScreen() {
  const [data, setData] = useState<CaptureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const next = await getCaptureData();
        if (alive) setData(next);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Failed to load capture data');
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
    <ScreenShell title="Capture" subtitle="Text, URL, and image entry (mock first).">
      {loading && (
        <View style={styles.stateWrap}>
          <ActivityIndicator color={palette.accent} />
          <Text style={styles.stateText}>Loading capture data...</Text>
        </View>
      )}
      {!loading && error && <Text style={styles.errorText}>{error}</Text>}
      {!loading && !error && !data && <Text style={styles.stateText}>No capture data</Text>}
      {!loading && !error && data && (
        <>
      <GlassCard>
        <Text style={styles.label}>Input Pod</Text>
        <Text style={styles.source}>Data Source: {data.source.toUpperCase()}</Text>
        <Text style={styles.text}>- Text input box</Text>
        <Text style={styles.text}>- URL input box</Text>
        <Text style={styles.text}>- Camera / gallery trigger</Text>
      </GlassCard>
      <GlassCard>
        <Text style={styles.label}>Recent Captures</Text>
        {data.recent.map(item => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.kind}>{item.kind.toUpperCase()}</Text>
            {item.sourceUrl ? (
              <TouchableOpacity onPress={() => Linking.openURL(item.sourceUrl!)}>
                <Text style={[styles.text, styles.link]} numberOfLines={1}>{item.content}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.text}>{item.content}</Text>
            )}
          </View>
        ))}
      </GlassCard>
        </>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  label: { color: palette.text, fontWeight: '600', marginBottom: 6 },
  source: { color: palette.textDim, fontSize: 11, fontFamily: 'monospace', marginBottom: 2 },
  text: { color: palette.textDim, fontSize: 13, lineHeight: 20 },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  kind: { color: palette.accent, fontFamily: 'monospace', fontSize: 11, marginTop: 2 },
  link: { color: palette.accent, textDecorationLine: 'underline' },
  stateWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stateText: { color: palette.textDim, fontSize: 12, fontFamily: 'monospace' },
  errorText: { color: palette.danger, fontSize: 12 },
});
