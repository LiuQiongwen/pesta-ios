import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/lib/constants';
import { useActions } from '@/hooks/useActions';
import { useAuth } from '@/hooks/useAuth';

interface ActionItem {
  id:        string;
  title:     string;
  status:    'pending' | 'in_progress' | 'done';
  priority:  'high' | 'mid' | 'low';
}

const MOCK_ACTIONS: ActionItem[] = [];

const PRIORITY_COLOR = {
  high: '#ff6680',
  mid:  '#ffa040',
  low:  COLORS.textDim,
};

export default function ActionScreen() {
  const { user } = useAuth();
  const [actions, setActions] = useState<ActionItem[]>(MOCK_ACTIONS);
  const [draft,   setDraft]   = useState('');
  const [filter,  setFilter]  = useState<'all' | 'pending' | 'in_progress' | 'done'>('all');
  const { actions: serverActions, create, loading, error, update } = useActions(user?.id);

  useEffect(() => {
    setActions(
      serverActions.map(item => ({
        id: item.id,
        title: item.content,
        status: item.status === 'dropped' ? 'pending' : item.status,
        priority: item.priority === 'normal' ? 'mid' : item.priority,
      }))
    );
  }, [serverActions]);

  const advanceStatus = (status: ActionItem['status']): ActionItem['status'] => {
    if (status === 'pending') return 'in_progress';
    if (status === 'in_progress') return 'done';
    return 'pending';
  };

  const cycleStatus = (id: string) => {
    const prev = actions;
    const target = prev.find(a => a.id === id);
    if (!target) return;
    const nextStatus = advanceStatus(target.status);

    setActions(current => current.map(a => (a.id === id ? { ...a, status: nextStatus } : a)));
    update(id, { status: nextStatus }).then(data => {
      if (!data) {
        // optimistic rollback
        setActions(prev);
      }
    });
  };

  const addAction = () => {
    if (!draft.trim()) return;
    create({ content: draft.trim(), status: 'pending', priority: 'normal' }).then(data => {
      if (!data) return;
      setDraft('');
    });
  };

  const pending = actions.filter(a => a.status === 'pending');
  const inProgress = actions.filter(a => a.status === 'in_progress');
  const completed = actions.filter(a => a.status === 'done');
  const visible = actions.filter(a => (filter === 'all' ? true : a.status === filter));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.label}>ACTION</Text>
          <Text style={styles.title}>行动</Text>
          <Text style={styles.subtitle}>知识转化为执行</Text>
        </View>

        {/* 快速添加 */}
        <View style={styles.addRow}>
          <TextInput
            style={styles.addInput}
            placeholder="添加行动项..."
            placeholderTextColor={COLORS.textDim}
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={addAction}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[styles.addBtn, !draft.trim() && styles.addBtnDisabled]}
            onPress={addAction}
            disabled={!draft.trim()}
          >
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          {[
            { key: 'all', label: `全部 ${actions.length}` },
            { key: 'pending', label: `待办 ${pending.length}` },
            { key: 'in_progress', label: `进行中 ${inProgress.length}` },
            { key: 'done', label: `完成 ${completed.length}` },
          ].map(item => (
            <TouchableOpacity
              key={item.key}
              style={[styles.filterChip, filter === item.key && styles.filterChipActive]}
              onPress={() => setFilter(item.key as 'all' | 'pending' | 'in_progress' | 'done')}
            >
              <Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {visible.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {filter === 'all' ? '全部行动项' : filter === 'pending' ? '待办' : filter === 'in_progress' ? '进行中' : '已完成'} · {visible.length}
            </Text>
            <View style={styles.list}>
              {visible.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.item, item.status === 'done' && styles.itemDone]}
                  onPress={() => cycleStatus(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.dot, { backgroundColor: PRIORITY_COLOR[item.priority] }]} />
                  <Text style={[styles.statusPill, item.status === 'pending' ? styles.pending : item.status === 'in_progress' ? styles.inProgress : styles.done]}>
                    {item.status === 'pending' ? '待办' : item.status === 'in_progress' ? '进行中' : '完成'}
                  </Text>
                  <Text style={[styles.itemText, item.status === 'done' && styles.itemTextDone]}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {actions.length > 0 && visible.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🗂️</Text>
            <Text style={styles.emptyText}>当前筛选下没有行动项</Text>
          </View>
        )}

        {/* 空状态 */}
        {actions.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🚀</Text>
            <Text style={styles.emptyText}>还没有行动项</Text>
            <Text style={styles.emptyHint}>
              {error ? `读取真实数据失败: ${error}` : '从分析报告中提取行动项，或手动添加'}
            </Text>
          </View>
        )}

        <Text style={styles.hint}>
          原生行动界面开发中 · 当前已接网站 useActions hook
        </Text>
        {loading && <Text style={styles.loadingText}>同步中...</Text>}
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

  addRow: {
    flexDirection: 'row',
    gap:           10,
    alignItems:    'center',
  },
  addInput: {
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
  addBtn: {
    width:           44,
    height:          44,
    backgroundColor: COLORS.accent,
    borderRadius:    12,
    alignItems:      'center',
    justifyContent:  'center',
  },
  addBtnDisabled: { opacity: 0.35 },
  addBtnText: {
    color:      COLORS.bg,
    fontSize:   24,
    fontWeight: '300',
    lineHeight: 28,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  filterChipActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentDim,
  },
  filterText: {
    color: COLORS.textDim,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  filterTextActive: {
    color: COLORS.accent,
    fontWeight: '600',
  },

  section:      { gap: 10 },
  sectionTitle: {
    fontSize:      10,
    color:         COLORS.textDim,
    fontFamily:    'monospace',
    letterSpacing: 2,
  },
  list: {
    backgroundColor: COLORS.surface,
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     COLORS.border,
    overflow:        'hidden',
  },
  item: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 16,
    paddingVertical:   14,
    gap:               12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  itemDone: { opacity: 0.45 },
  dot: {
    width:        8,
    height:       8,
    borderRadius: 4,
  },
  checkmark: { fontSize: 14, color: COLORS.accent, width: 14 },
  statusPill: {
    fontSize: 10,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: 'hidden',
    fontFamily: 'monospace',
  },
  pending: { color: '#ffa040', backgroundColor: 'rgba(255,160,64,0.15)' },
  inProgress: { color: '#66f0ff', backgroundColor: 'rgba(102,240,255,0.15)' },
  done: { color: '#44ff99', backgroundColor: 'rgba(68,255,153,0.15)' },
  itemText:     { fontSize: 14, color: COLORS.text, flex: 1 },
  itemTextDone: { textDecorationLine: 'line-through' },

  empty: {
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap:             12,
  },
  emptyIcon: { fontSize: 48, opacity: 0.6 },
  emptyText: { fontSize: 16, color: COLORS.textDim },
  emptyHint: {
    fontSize:  12,
    color:     'rgba(80,95,120,0.5)',
    textAlign: 'center',
  },

  hint: {
    fontSize:   11,
    color:      'rgba(80,95,120,0.5)',
    fontFamily: 'monospace',
    textAlign:  'center',
    lineHeight: 18,
  },
  loadingText: { color: COLORS.textDim, textAlign: 'center', fontSize: 12, marginTop: -10 },
});
