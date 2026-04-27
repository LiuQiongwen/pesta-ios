import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParams } from '@/navigation/types';
import { COLORS } from '@/lib/constants';

type Nav = BottomTabNavigationProp<MainTabParams>;

const QUICK_ACTIONS = [
  { label: '星图',      emoji: '🌐', tab: 'WebView',  accent: '#66f0ff' },
  { label: 'AI 对话',  emoji: '✨', tab: 'Chat',     accent: '#b496ff' },
  { label: '知识图谱', emoji: '🕸️', tab: 'Graph',    accent: '#ffa040' },
  { label: '设置',     emoji: '⚙️', tab: 'Settings', accent: '#88a0cc' },
] as const;

export default function HomeScreen() {
  const { user } = useAuth();
  const nav      = useNavigation<Nav>();
  const username = user?.email?.split('@')[0] ?? '探索者';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>欢迎回来</Text>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.tagline}>你的知识宇宙正在生长</Text>
        </View>

        {/* 快捷入口 */}
        <Text style={styles.sectionLabel}>快速进入</Text>
        <View style={styles.grid}>
          {QUICK_ACTIONS.map(action => (
            <TouchableOpacity
              key={action.tab}
              style={[styles.card, { borderColor: `${action.accent}30` }]}
              onPress={() => nav.navigate(action.tab as never)}
              activeOpacity={0.75}
            >
              <Text style={styles.cardEmoji}>{action.emoji}</Text>
              <Text style={[styles.cardLabel, { color: action.accent }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.version}>PESTA v1.0 · Hybrid Mode</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.bg },
  scroll:  { flex: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 40 },

  header:   { paddingVertical: 24, gap: 4 },
  greeting: { fontSize: 13, color: COLORS.textDim, fontFamily: 'monospace', letterSpacing: 2 },
  username: { fontSize: 26, fontWeight: '700', color: COLORS.text, marginTop: 4 },
  tagline:  { fontSize: 12, color: COLORS.textDim, marginTop: 2 },

  sectionLabel: {
    fontSize: 11, color: COLORS.textDim,
    fontFamily: 'monospace', letterSpacing: 2, marginBottom: -4,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width:           '47%',
    backgroundColor: COLORS.surface,
    borderRadius:    14,
    borderWidth:     1,
    padding:         18,
    gap:             8,
  },
  cardEmoji: { fontSize: 28 },
  cardLabel: { fontSize: 13, fontWeight: '600' },

  version: {
    textAlign:  'center',
    fontSize:   10,
    color:      'rgba(80,95,120,0.40)',
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginTop: 8,
  },
});
