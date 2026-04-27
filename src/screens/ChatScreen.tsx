import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/lib/constants';

/**
 * TODO 第二阶段原生化：
 * - FlatList 消息气泡
 * - 调用 Supabase Edge Function / AI API
 * - expo-speech TTS
 */
export default function ChatScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.icon}>✨</Text>
        <Text style={styles.title}>AI 对话</Text>
        <Text style={styles.sub}>原生 Chat 界面开发中</Text>
        <Text style={styles.hint}>
          当前阶段请通过「星图」Tab 访问网页版 AI
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.bg },
  center: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            10,
    padding:        32,
  },
  icon:  { fontSize: 48 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  sub:   { fontSize: 13, color: COLORS.textDim },
  hint:  {
    fontSize:   11,
    color:      COLORS.textDim,
    textAlign:  'center',
    marginTop:  8,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
});
