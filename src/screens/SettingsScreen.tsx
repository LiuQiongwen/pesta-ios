import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { APP_CONFIG, COLORS } from '@/lib/constants';
import { supabaseConfigured } from '@/lib/supabase';

function Row({
  label, value, onPress, danger,
}: {
  label: string; value?: string; onPress?: () => void; danger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.65}
    >
      <Text style={[styles.rowLabel, danger && { color: COLORS.error }]}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const webConfigured = APP_CONFIG.WEB_URL !== 'https://your-pesta-site.com';

  const handleSignOut = () => {
    Alert.alert('退出登录', '确定要退出吗？', [
      { text: '取消',  style: 'cancel' },
      { text: '退出',  style: 'destructive', onPress: signOut },
    ]);
  };

  const openReleaseChecklistHint = () => {
    Alert.alert(
      '发布检查清单',
      '已在项目中生成 docs/RELEASE_CHECKLIST.md。\n请按清单执行 SQL、真机验证与发布前检查。'
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>设置</Text>

        <Text style={styles.section}>账户</Text>
        <View style={styles.group}>
          <Row label="邮箱"    value={user?.email ?? '--'} />
          <Row label="用户 ID" value={`${user?.id?.slice(0, 8) ?? '--'}...`} />
        </View>

        <Text style={styles.section}>应用</Text>
        <View style={styles.group}>
          <Row label="网站地址" value={APP_CONFIG.WEB_URL} />
          <Row label="版本"     value="1.0.0 (Hybrid)" />
          <Row label="WEB_URL 配置" value={webConfigured ? 'OK' : 'MISSING'} />
          <Row label="Supabase 配置" value={supabaseConfigured ? 'OK' : 'MISSING'} />
          <Row
            label="订阅管理"
            value="即将推出"
            onPress={() => Alert.alert('Apple 内购', '即将接入，敬请期待')}
          />
          <Row label="发布检查清单" value="docs/RELEASE_CHECKLIST.md" onPress={openReleaseChecklistHint} />
        </View>

        <View style={[styles.group, { marginTop: 24 }]}>
          <Row label="退出登录" onPress={handleSignOut} danger />
        </View>

        <Text style={styles.footer}>
          PESTA · Hybrid Architecture v1.0{'\n'}
          WebView + Native Shell
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, gap: 6, paddingBottom: 40 },

  title: {
    fontSize: 22, fontWeight: '700', color: COLORS.text,
    marginBottom: 16, marginTop: 4,
  },
  section: {
    fontSize: 11, color: COLORS.textDim,
    fontFamily: 'monospace', letterSpacing: 2,
    marginTop: 16, marginBottom: 6, marginLeft: 4,
  },
  group: {
    backgroundColor: COLORS.surface,
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     COLORS.border,
    overflow:        'hidden',
  },
  row: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    paddingHorizontal: 16,
    paddingVertical:  14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  rowLabel: { fontSize: 14, color: COLORS.text },
  rowValue: {
    fontSize:  12,
    color:     COLORS.textDim,
    maxWidth:  '55%',
    textAlign: 'right',
  },
  footer: {
    marginTop:  32,
    textAlign:  'center',
    fontSize:   10,
    color:      'rgba(80,95,120,0.35)',
    fontFamily: 'monospace',
    letterSpacing: 1,
    lineHeight: 18,
  },
});
