import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, View, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { palette } from '@/theme/palette';
import { getSearchData, type SearchData } from '@/features/search/data';

export default function SearchScreen() {
  const [data, setData] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const next = await getSearchData();
        if (alive) setData(next);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Failed to load search data');
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
    <ScreenShell title="Search" subtitle="RAG-ready UI shell with mock results.">
      {loading && (
        <View style={styles.stateWrap}>
          <ActivityIndicator color={palette.accent} />
          <Text style={styles.stateText}>Loading search data...</Text>
        </View>
      )}
      {!loading && error && <Text style={styles.errorText}>{error}</Text>}
      {!loading && !error && !data && <Text style={styles.stateText}>No search data</Text>}
      {!loading && !error && data && (
        <>
      <GlassCard>
        <Text style={styles.label}>Query</Text>
        <Text style={styles.source}>Data Source: {data.source.toUpperCase()}</Text>
        <Text style={styles.inputMock}>{data.query}</Text>
      </GlassCard>
      <GlassCard>
        <Text style={styles.label}>Results</Text>
        {data.results.map(item => (
          <View key={item.id} style={styles.result}>
            <Text style={styles.type}>{item.type}</Text>
            {item.sourceUrl ? (
              <TouchableOpacity onPress={() => Linking.openURL(item.sourceUrl!)}>
                <Text style={[styles.text, styles.link]} numberOfLines={2}>
                  {item.text}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.text}>{item.text}</Text>
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
  label: { color: palette.text, fontWeight: '600' },
  source: { color: palette.textDim, fontSize: 11, fontFamily: 'monospace', marginTop: 2 },
  inputMock: {
    marginTop: 8,
    color: palette.textDim,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  result: { marginTop: 10, gap: 4 },
  type: { color: palette.accent, fontSize: 11, fontFamily: 'monospace' },
  text: { color: palette.textDim, fontSize: 13 },
  link: { color: palette.accent, textDecorationLine: 'underline' },
  stateWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stateText: { color: palette.textDim, fontSize: 12, fontFamily: 'monospace' },
  errorText: { color: palette.danger, fontSize: 12 },
});
