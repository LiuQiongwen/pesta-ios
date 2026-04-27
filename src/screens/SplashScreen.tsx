import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { COLORS } from '@/lib/constants';

export default function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(0.85)).current;
  const glow    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scale,   { toValue: 1, friction: 6,   useNativeDriver: true }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 1400, useNativeDriver: true }),
          Animated.timing(glow, { toValue: 0, duration: 1400, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.7] });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.wrap, { opacity, transform: [{ scale }] }]}>
        <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />
        <Text style={styles.star}>✦</Text>
        <Text style={styles.brand}>PESTA</Text>
        <Text style={styles.tagline}>知识的宇宙</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrap: { alignItems: 'center', gap: 10 },
  glow: {
    position:        'absolute',
    width:           130,
    height:          130,
    borderRadius:    65,
    backgroundColor: COLORS.accent,
    top:             -24,
  },
  star: { fontSize: 58, color: COLORS.accent },
  brand: {
    fontSize:      28,
    fontWeight:    '700',
    color:         COLORS.text,
    letterSpacing: 8,
    fontFamily:    'monospace',
  },
  tagline: {
    fontSize:      12,
    color:         COLORS.textDim,
    letterSpacing: 3,
    fontFamily:    'monospace',
  },
});
