import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/lib/constants';

/**
 * TODO 第三阶段原生化：
 * - 2D: react-native-svg + d3-force
 * - 3D: expo-gl + three.js
 * - 数据: supabase.from('notes').select(...)
 */
export default function GraphScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.icon}>🕸️</Text>
        <Text style={styles.title}>知识图谱</Text>
        <Text style={styles.sub}>2D / 3D 原生图谱开发中</Text>
        <Text style={styles.hint}>
          规划方案:{'\n'}
          2D → react-native-svg + d3-force{'\n'}
          3D → expo-gl + three.js
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
