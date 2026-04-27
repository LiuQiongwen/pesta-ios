import 'react-native-gesture-handler'; // 必须放最顶部
import React, { useEffect } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreenApi from 'expo-splash-screen';
import { AuthProvider } from '@/store/AuthContext';
import RootNavigator from '@/navigation/RootNavigator';
import { COLORS } from '@/lib/constants';

// 阻止 Expo 自动隐藏启动图，等 session 恢复完再隐藏
SplashScreenApi.preventAutoHideAsync();

// 基于 DarkTheme 覆盖颜色，保留 fonts 等 v7 必要字段
const AppTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary:      COLORS.accent,
    background:   COLORS.bg,
    card:         COLORS.surface,
    text:         COLORS.text,
    border:       COLORS.border,
    notification: COLORS.accent,
  },
};

export default function App() {
  useEffect(() => {
    const t = setTimeout(() => SplashScreenApi.hideAsync(), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer theme={AppTheme}>
          <StatusBar style="light" backgroundColor={COLORS.bg} />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
