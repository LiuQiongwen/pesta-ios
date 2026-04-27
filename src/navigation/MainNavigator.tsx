import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MainTabParams } from './types';
import { COLORS } from '@/lib/constants';

import CaptureScreen from '@/screens/CaptureScreen';
import SearchScreen  from '@/screens/SearchScreen';
import StarMapScreen from '@/screens/StarMapScreen';
import InsightScreen from '@/screens/InsightScreen';
import MemoryScreen  from '@/screens/MemoryScreen';
import ActionScreen  from '@/screens/ActionScreen';

const Tab = createBottomTabNavigator<MainTabParams>();

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 19, opacity: focused ? 1 : 0.38 }}>
      {emoji}
    </Text>
  );
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const starIndex = state.routes.findIndex(r => r.name === 'StarMap');
  const sideRoutes = state.routes.filter(r => r.name !== 'StarMap');
  const leftRoutes = sideRoutes.slice(0, 2);
  const rightRoutes = sideRoutes.slice(2);

  const renderRoute = (route: (typeof state.routes)[number]) => {
    const routeIndex = state.routes.findIndex(r => r.key === route.key);
    const focused = state.index === routeIndex;
    const { options } = descriptors[route.key];
    const label =
      typeof options.tabBarLabel === 'string'
        ? options.tabBarLabel
        : typeof options.title === 'string'
          ? options.title
          : route.name;
    const iconNode = options.tabBarIcon?.({
      focused,
      color: focused ? COLORS.accent : COLORS.textDim,
      size: 18,
    });

    return (
      <TouchableOpacity
        key={route.key}
        style={styles.sideItem}
        onPress={() => navigation.navigate(route.name as never)}
        activeOpacity={0.8}
      >
        {iconNode}
        <Text style={[styles.sideLabel, focused && styles.sideLabelFocused]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const starRoute = state.routes[starIndex];
  const starFocused = state.index === starIndex;
  const starOptions = descriptors[starRoute.key].options;

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.sideRow}>
        <View style={styles.group}>{leftRoutes.map(renderRoute)}</View>
        <View style={styles.centerGap} />
        <View style={styles.group}>{rightRoutes.map(renderRoute)}</View>
      </View>

      <TouchableOpacity
        style={[styles.starBtn, starFocused && styles.starBtnFocused]}
        onPress={() => navigation.navigate('StarMap')}
        activeOpacity={0.85}
      >
        {starOptions.tabBarIcon?.({
          focused: starFocused,
          color: starFocused ? COLORS.accent : COLORS.textDim,
          size: 22,
        })}
        <Text style={[styles.starLabel, starFocused && styles.starLabelFocused]}>星图</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="StarMap"
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Capture"
        component={CaptureScreen}
        options={{
          tabBarLabel: '捕获',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📥" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: '检索',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔭" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="StarMap"
        component={StarMapScreen}
        options={{
          tabBarLabel: '星图',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600', letterSpacing: 1 },
          tabBarIcon: ({ focused }) => (
            <Text style={{
              fontSize:   22,
              color:      focused ? COLORS.accent : COLORS.textDim,
              opacity:    focused ? 1 : 0.38,
              lineHeight: 26,
            }}>
              ✦
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Insight"
        component={InsightScreen}
        options={{
          tabBarLabel: '洞察',
          tabBarIcon: ({ focused }) => <TabIcon emoji="✨" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Memory"
        component={MemoryScreen}
        options={{
          tabBarLabel: '记忆',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🧠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Action"
        component={ActionScreen}
        options={{
          tabBarLabel: '行动',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🚀" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.tabBar,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 10,
  },
  sideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    minHeight: 58,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  centerGap: {
    width: 78,
  },
  sideItem: {
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    gap: 2,
  },
  sideLabel: {
    fontSize: 9,
    color: COLORS.textDim,
    letterSpacing: 0.4,
  },
  sideLabelFocused: {
    color: COLORS.accent,
  },
  starBtn: {
    position: 'absolute',
    left: '50%',
    marginLeft: -30,
    top: -14,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  starBtnFocused: {
    borderColor: COLORS.accent,
    backgroundColor: '#09182b',
  },
  starLabel: {
    fontSize: 10,
    color: COLORS.textDim,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  starLabelFocused: {
    color: COLORS.accent,
  },
});
