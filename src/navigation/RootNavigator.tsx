import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParams } from './types';
import { useAuth } from '@/hooks/useAuth';

import SplashScreen  from '@/screens/SplashScreen';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator<RootStackParams>();

export default function RootNavigator() {
  const { session, loading } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {loading ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : session ? (
        <Stack.Screen name="Main"   component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth"   component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
