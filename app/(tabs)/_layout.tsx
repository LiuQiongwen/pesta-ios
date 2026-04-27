import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { palette } from '@/theme/palette';

function TabIcon({ glyph, focused }: { glyph: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 16, color: focused ? palette.accent : palette.textDim }}>
      {glyph}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#080d18',
          borderTopColor: palette.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: palette.accent,
        tabBarInactiveTintColor: palette.textDim,
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ focused }) => <TabIcon glyph="✦" focused={focused} /> }} />
      <Tabs.Screen name="capture" options={{ title: 'Capture', tabBarIcon: ({ focused }) => <TabIcon glyph="◉" focused={focused} /> }} />
      <Tabs.Screen name="search" options={{ title: 'Search', tabBarIcon: ({ focused }) => <TabIcon glyph="⌕" focused={focused} /> }} />
      <Tabs.Screen name="memory" options={{ title: 'Memory', tabBarIcon: ({ focused }) => <TabIcon glyph="▣" focused={focused} /> }} />
      <Tabs.Screen name="action" options={{ title: 'Action', tabBarIcon: ({ focused }) => <TabIcon glyph="✓" focused={focused} /> }} />
    </Tabs>
  );
}
