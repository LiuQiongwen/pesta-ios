import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { useNotes } from '@/hooks/useNotes';
import { useMemoryReview } from '@/hooks/useMemoryReview';

function nextIndex(current: number, total: number): number {
  if (total <= 1) return 0;
  return (current + 1) % total;
}

export default function MemoryScreen() {
  const { user } = useAuth();
  const { notes, loading, error } = useNotes(user?.id, null);
  const [idx, setIdx] = useState(0);
  const [showBack, setShowBack] = useState(false);

  const cards = useMemo(
    () =>
      notes
        .filter(n => n.content.trim().length > 0)
        .slice(0, 50)
        .map(n => ({
          id: n.id,
          front: n.title || '回忆这条知识',
          back: n.content,
        })),
    [notes]
  );

  const card = cards[idx];
  const cardIds = useMemo(() => cards.map(c => c.id), [cards]);
  const { hydrated, dueIds, rateCard, getSummary } = useMemoryReview(cardIds, user?.id);
  const dueCards = useMemo(() => cards.filter(c => dueIds.includes(c.id)), [cards, dueIds]);
  const activeCards = dueCards.length > 0 ? dueCards : cards;
  const activeCard = activeCards[idx];
  const activeSummary = activeCard ? getSummary(activeCard.id) : null;

  useEffect(() => {
    if (idx < activeCards.length) return;
    setIdx(0);
  }, [activeCards.length, idx]);

  const onNext = () => {
    setShowBack(false);
    setIdx(prev => nextIndex(prev, activeCards.length));
  };

  const onGrade = async (grade: 'again' | 'hard' | 'good' | 'easy') => {
    if (!activeCard) return;
    await rateCard(activeCard.id, grade);
    onNext();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.label}>MEMORY</Text>
          <Text style={styles.title}>记忆</Text>
          <Text style={styles.subtitle}>抽认卡 + 间隔复习（Week 3 原生化）</Text>
        </View>

        <View style={styles.card}>
          {loading || !hydrated ? (
            <Text style={styles.cardText}>载入卡片中...</Text>
          ) : activeCard ? (
            <>
              <Text style={styles.cardTag}>{showBack ? 'ANSWER' : 'PROMPT'}</Text>
              <Text style={styles.cardText}>{showBack ? activeCard.back : activeCard.front}</Text>
            </>
          ) : (
            <Text style={styles.cardText}>还没有可复习内容，先去「捕获」记录一些知识。</Text>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.flipBtn]}
            onPress={() => setShowBack(prev => !prev)}
            disabled={!activeCard}
          >
            <Text style={styles.flipText}>{showBack ? '看问题' : '看答案'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.nextBtn]} onPress={onNext} disabled={!activeCard}>
            <Text style={styles.nextText}>下一张</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gradeRow}>
          <TouchableOpacity style={[styles.gradeBtn, styles.again]} onPress={() => onGrade('again')} disabled={!activeCard}>
            <Text style={styles.gradeText}>Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.gradeBtn, styles.hard]} onPress={() => onGrade('hard')} disabled={!activeCard}>
            <Text style={styles.gradeText}>Hard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.gradeBtn, styles.good]} onPress={() => onGrade('good')} disabled={!activeCard}>
            <Text style={styles.gradeText}>Good</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.gradeBtn, styles.easy]} onPress={() => onGrade('easy')} disabled={!activeCard}>
            <Text style={styles.gradeText}>Easy</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.meta}>
          {activeCard ? `${idx + 1} / ${activeCards.length} · Due ${dueCards.length}` : '0 / 0'}
        </Text>
        {activeSummary && (
          <Text style={styles.subMeta}>
            间隔 {activeSummary.intervalDays} 天 · 复习 {activeSummary.reps} 次
          </Text>
        )}
        <Text style={styles.hint}>
          {error ? `读取真实数据失败: ${error}` : '当前使用 notes 作为复习卡片源，后续可切 MemoryBox 逻辑'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, padding: 24, gap: 18 },
  header: { gap: 4, marginBottom: 4 },
  label: {
    fontSize: 10,
    color: COLORS.accent,
    fontFamily: 'monospace',
    letterSpacing: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textDim,
  },
  card: {
    flex: 1,
    minHeight: 260,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    justifyContent: 'center',
    gap: 12,
  },
  cardTag: {
    color: COLORS.accent,
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 1.8,
  },
  cardText: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 26,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  flipText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  nextBtn: { backgroundColor: COLORS.accent },
  nextText: { color: COLORS.bg, fontSize: 14, fontWeight: '700' },
  meta: {
    textAlign: 'center',
    color: COLORS.textDim,
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 1.5,
  },
  hint: {
    fontSize: 11,
    color: 'rgba(80,95,120,0.5)',
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: 18,
  },
  subMeta: {
    textAlign: 'center',
    color: COLORS.textDim,
    fontSize: 11,
    marginTop: -12,
  },
  gradeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gradeBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  again: { borderColor: '#ff668060' },
  hard: { borderColor: '#ffa04060' },
  good: { borderColor: '#66f0ff60' },
  easy: { borderColor: '#44ff9960' },
  gradeText: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
});
