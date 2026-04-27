import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Linking, Alert,
  StyleSheet, FlatList, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/lib/constants';
import { useRAG } from '@/hooks/useRAG';
import { useNotes } from '@/hooks/useNotes';
import { useAuth } from '@/hooks/useAuth';

interface Result {
  id:      string;
  title:   string;
  excerpt: string;
  type:    string;
  link?:   string;
}

export default function SearchScreen() {
  const { user } = useAuth();
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [usedFallback, setUsedFallback] = useState(false);
  const { search, loading, error } = useRAG();
  const { searchNotes } = useNotes(user?.id, null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setUsedFallback(false);
    const convo = await search(query);
    const ragRows = (convo?.citations ?? []).map(item => ({
      id: `${item.id}`,
      title: item.note_title || '未命名',
      excerpt: item.excerpt,
      type: 'RAG',
    }));

    if (ragRows.length > 0) {
      setResults(ragRows);
      return;
    }

    const notesRows = await searchNotes(query);
    setResults(
      notesRows.map(item => ({
        id: item.id,
        title: item.title,
        excerpt: item.attachmentUrl || item.sourceUrl || item.content,
        type:
          item.sourceType === 'image'
            ? 'IMAGE'
            : item.sourceType === 'url'
              ? 'URL'
              : 'NOTE',
        link:
          item.sourceType === 'image'
            ? item.attachmentUrl ?? undefined
            : item.sourceType === 'url'
              ? item.sourceUrl ?? undefined
              : undefined,
      }))
    );
    setUsedFallback(notesRows.length > 0);
  };

  const openResult = async (item: Result) => {
    if (!item.link) return;
    const can = await Linking.canOpenURL(item.link);
    if (!can) {
      Alert.alert('无法打开链接', item.link);
      return;
    }
    await Linking.openURL(item.link);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.label}>SEARCH</Text>
          <Text style={styles.title}>检索</Text>
        </View>

        {/* 搜索栏 */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="语义搜索你的知识宇宙..."
            placeholderTextColor={COLORS.textDim}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={COLORS.bg} size="small" />
              : <Text style={styles.searchBtnText}>🔭</Text>
            }
          </TouchableOpacity>
        </View>

        {/* 结果列表 */}
        {results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultCard}
                activeOpacity={item.link ? 0.7 : 1}
                onPress={() => openResult(item)}
                disabled={!item.link}
              >
                <View style={styles.resultHeader}>
                  <Text style={styles.resultType}>{item.type}</Text>
                  {item.link ? <Text style={styles.openHint}>打开</Text> : null}
                </View>
                <Text style={styles.resultTitle}>{item.title}</Text>
                <Text style={styles.resultExcerpt} numberOfLines={2}>
                  {item.excerpt}
                </Text>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔭</Text>
            <Text style={styles.emptyText}>
              {query ? '未找到相关内容' : '输入关键词，跨越宇宙检索'}
            </Text>
            <Text style={styles.hint}>
              {error
                ? `RAG不可用，已切到基础检索: ${error}`
                : usedFallback
                  ? '当前结果来自 notes 基础检索兜底'
                  : '原生 RAG 语义检索开发中 · 当前已接网站 useRAG hook'}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, padding: 24, gap: 20 },

  header: { gap: 4 },
  label: {
    fontSize:      10,
    color:         COLORS.accent,
    fontFamily:    'monospace',
    letterSpacing: 3,
  },
  title: {
    fontSize:   28,
    fontWeight: '700',
    color:      COLORS.text,
  },

  searchRow: {
    flexDirection: 'row',
    gap:           10,
    alignItems:    'center',
  },
  input: {
    flex:            1,
    backgroundColor: COLORS.surface,
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     COLORS.border,
    paddingHorizontal: 14,
    paddingVertical:   12,
    color:           COLORS.text,
    fontSize:        14,
  },
  searchBtn: {
    width:           44,
    height:          44,
    backgroundColor: COLORS.accent,
    borderRadius:    12,
    alignItems:      'center',
    justifyContent:  'center',
  },
  searchBtnText: { fontSize: 20 },

  list: { gap: 12, paddingTop: 4 },
  resultCard: {
    backgroundColor: COLORS.surface,
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     COLORS.border,
    padding:         16,
    gap:             6,
  },
  resultHeader: { flexDirection: 'row' },
  openHint: {
    marginLeft: 8,
    color: COLORS.textDim,
    fontSize: 10,
    fontFamily: 'monospace',
  },
  resultType: {
    fontSize:          10,
    color:             COLORS.accent,
    fontFamily:        'monospace',
    letterSpacing:     2,
    backgroundColor:   COLORS.accentDim,
    paddingHorizontal: 8,
    paddingVertical:   2,
    borderRadius:      4,
  },
  resultTitle:   { fontSize: 14, fontWeight: '600', color: COLORS.text },
  resultExcerpt: { fontSize: 12, color: COLORS.textDim, lineHeight: 18 },

  empty: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            12,
  },
  emptyIcon: { fontSize: 48, opacity: 0.6 },
  emptyText: {
    fontSize:  14,
    color:     COLORS.textDim,
    textAlign: 'center',
  },
  hint: {
    fontSize:   11,
    color:      'rgba(80,95,120,0.5)',
    fontFamily: 'monospace',
    textAlign:  'center',
    lineHeight: 18,
    marginTop:  8,
  },
});
