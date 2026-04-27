import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/lib/constants';
import { useNotes, type NoteItem } from '@/hooks/useNotes';
import { useAuth } from '@/hooks/useAuth';

const INSIGHT_TYPES = [
  { key: 'Facts',    label: '事实',   color: '#66f0ff', icon: '◆' },
  { key: 'Opinions', label: '观点',   color: '#b496ff', icon: '◈' },
  { key: 'Methods',  label: '方法',   color: '#ffa040', icon: '◉' },
  { key: 'Insights', label: '洞见',   color: '#ff6680', icon: '✦' },
  { key: 'Actions',  label: '行动项', color: '#44ff99', icon: '▶' },
] as const;

const SOURCE_TYPES = [
  { key: 'text', label: '文本捕获', color: '#66f0ff' },
  { key: 'url', label: 'URL 捕获', color: '#b496ff' },
  { key: 'image', label: '图片捕获', color: '#44ff99' },
] as const;

export default function InsightScreen() {
  const { user } = useAuth();
  const { listNotes, error } = useNotes(user?.id, null);
  const [rows, setRows] = useState<NoteItem[]>([]);

  useEffect(() => {
    listNotes({ limit: 200 }).then(setRows);
  }, [listNotes]);

  const countByKind = useMemo(() => {
    return rows.reduce<Record<string, number>>((acc, item) => {
      const key = item.kind.toLowerCase();
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
  }, [rows]);

  const countBySourceType = useMemo(() => {
    return rows.reduce<Record<string, number>>((acc, item) => {
      const key = (item.sourceType || 'text').toLowerCase();
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
  }, [rows]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.label}>INSIGHT</Text>
          <Text style={styles.title}>洞察</Text>
          <Text style={styles.subtitle}>AI 提炼的知识精华</Text>
        </View>

        <View style={styles.sourceWrap}>
          <Text style={styles.sourceTitle}>捕获来源分布</Text>
          <View style={styles.sourceRow}>
            {SOURCE_TYPES.map(item => (
              <View key={item.key} style={styles.sourceItem}>
                <View style={[styles.sourceDot, { backgroundColor: item.color }]} />
                <Text style={styles.sourceLabel}>{item.label}</Text>
                <Text style={styles.sourceCount}>{countBySourceType[item.key] ?? 0}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 洞见类型卡片 */}
        <View style={styles.grid}>
          {INSIGHT_TYPES.map(type => (
            <TouchableOpacity
              key={type.key}
              style={[styles.card, { borderColor: type.color + '30' }]}
              activeOpacity={0.75}
            >
              <Text style={[styles.cardIcon, { color: type.color }]}>
                {type.icon}
              </Text>
              <Text style={[styles.cardLabel, { color: type.color }]}>
                {type.label}
              </Text>
              <Text style={styles.cardCount}>{countByKind[type.key.toLowerCase()] ?? 0} 条</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 认知报告入口 */}
        <TouchableOpacity style={styles.reportCard} activeOpacity={0.8}>
          <View style={styles.reportLeft}>
            <Text style={styles.reportIcon}>🧠</Text>
            <View>
              <Text style={styles.reportTitle}>认知报告</Text>
              <Text style={styles.reportSub}>你的思维模式与知识盲区</Text>
            </View>
          </View>
          <Text style={styles.reportArrow}>›</Text>
        </TouchableOpacity>

        {/* Distillation 入口 */}
        <TouchableOpacity style={styles.reportCard} activeOpacity={0.8}>
          <View style={styles.reportLeft}>
            <Text style={styles.reportIcon}>⚗️</Text>
            <View>
              <Text style={styles.reportTitle}>知识蒸馏</Text>
              <Text style={styles.reportSub}>分层提炼，精炼核心内容</Text>
            </View>
          </View>
          <Text style={styles.reportArrow}>›</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          {error
            ? `读取真实数据失败: ${error}`
            : '原生洞察界面开发中 · 当前已接 Supabase 基础统计'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 24, gap: 20, paddingBottom: 40 },

  header: { gap: 4, marginBottom: 4 },
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
  subtitle: {
    fontSize: 13,
    color:    COLORS.textDim,
  },

  grid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           12,
  },
  card: {
    width:           '47%',
    backgroundColor: COLORS.surface,
    borderRadius:    14,
    borderWidth:     1,
    padding:         16,
    gap:             6,
  },
  cardIcon:  { fontSize: 22 },
  cardLabel: { fontSize: 14, fontWeight: '600' },
  cardCount: { fontSize: 12, color: COLORS.textDim, fontFamily: 'monospace' },

  reportCard: {
    backgroundColor: COLORS.surface,
    borderRadius:    14,
    borderWidth:     1,
    borderColor:     COLORS.border,
    padding:         16,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
  },
  reportLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           14,
  },
  reportIcon:  { fontSize: 28 },
  reportTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  reportSub:   { fontSize: 12, color: COLORS.textDim, marginTop: 2 },
  reportArrow: { fontSize: 22, color: COLORS.textDim },
  sourceWrap: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 10,
  },
  sourceTitle: {
    color: COLORS.textDim,
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 1.6,
  },
  sourceRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  sourceItem: {
    minWidth: '30%',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
  },
  sourceDot: { width: 8, height: 8, borderRadius: 4 },
  sourceLabel: { color: COLORS.textDim, fontSize: 11 },
  sourceCount: { color: COLORS.text, fontSize: 14, fontWeight: '700' },

  hint: {
    fontSize:   11,
    color:      'rgba(80,95,120,0.5)',
    fontFamily: 'monospace',
    textAlign:  'center',
    lineHeight: 18,
    marginTop:  8,
  },
});
