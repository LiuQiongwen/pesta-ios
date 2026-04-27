import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { StarMapCanvas } from '@/features/home/StarMapCanvas';
import { NodeBottomSheet } from '@/features/home/NodeBottomSheet';
import type { StarNode } from '@/mock/homeNodes';
import { getHomeData, type HomeData } from '@/features/home/data';
import { GlassCard } from '@/components/ui/GlassCard';
import { palette } from '@/theme/palette';

export default function HomeScreen() {
  const [selected, setSelected] = useState<StarNode | null>(null);
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const next = await getHomeData();
        if (alive) setData(next);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Failed to load home data');
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator color={palette.accent} />
        <Text style={styles.placeholderText}>Loading Home_Default...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.errorText}>Failed to load home data</Text>
        <Text style={styles.placeholderText}>{error}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.placeholderText}>No home data available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>PESTA</Text>
        <Text style={styles.title}>Knowledge Cosmos</Text>
        <Text style={styles.subtitle}>Dark premium glassmorphism, mock-only first iteration.</Text>
        <StarMapCanvas nodes={data.nodes} onPressNode={setSelected} />

        <GlassCard style={styles.stats}>
          <Text style={styles.statsLabel}>Quick Stats</Text>
          <Text style={styles.statsValue}>
            Nodes {data.stats.nodes} • Active {data.stats.active} • Pending {data.stats.pending}
          </Text>
          <Text style={styles.statsSource}>Data Source: {data.stats.source.toUpperCase()}</Text>
        </GlassCard>
      </ScrollView>

      <NodeBottomSheet node={selected} onClose={() => setSelected(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 18, gap: 14, paddingBottom: 28 },
  kicker: {
    color: palette.textDim,
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 8,
  },
  title: { color: palette.text, fontSize: 28, fontWeight: '700' },
  subtitle: { color: palette.textDim, fontSize: 13 },
  stats: { gap: 6 },
  statsLabel: { color: palette.textDim, fontSize: 12 },
  statsValue: { color: palette.text, fontWeight: '600' },
  statsSource: { color: palette.textDim, fontSize: 11, fontFamily: 'monospace' },
  center: { alignItems: 'center', justifyContent: 'center', gap: 8 },
  placeholderText: { color: palette.textDim, fontSize: 12, fontFamily: 'monospace' },
  errorText: { color: palette.danger, fontSize: 14, fontWeight: '600' },
});
