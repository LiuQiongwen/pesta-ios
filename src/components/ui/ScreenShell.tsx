import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { palette } from '@/theme/palette';

type Props = {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
};

export function ScreenShell({ title, subtitle, children }: Props) {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 18, gap: 12, paddingBottom: 28 },
  title: { color: palette.text, fontSize: 26, fontWeight: '700', marginTop: 10 },
  subtitle: { color: palette.textDim, fontSize: 13, marginBottom: 4 },
});
