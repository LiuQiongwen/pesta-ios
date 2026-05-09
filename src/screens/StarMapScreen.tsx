import React, { useRef, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuth } from '@/hooks/useAuth';
import { APP_CONFIG, COLORS } from '@/lib/constants';
import { buildNativeBridgeScript, getWebOrigin, isTrustedWebUrl } from '@/lib/nativeWebBridge';
import type { MainTabParams } from '@/navigation/types';

type Nav = BottomTabNavigationProp<MainTabParams>;

const STAR_MAP_URL = APP_CONFIG.WEB_URL + '/app';
const TRUSTED_WEB_ORIGIN = getWebOrigin(APP_CONFIG.WEB_URL);

const ROUTE_MAP: Record<string, keyof MainTabParams> = {
  Capture: 'Capture',
  Search:  'Search',
  Insight: 'Insight',
  Memory:  'Memory',
  Action:  'Action',
  capture: 'Capture',
  search:  'Search',
  insight: 'Insight',
  memory:  'Memory',
  action:  'Action',
};

export default function StarMapScreen() {
  const { session } = useAuth();
  const navigation  = useNavigation<Nav>();
  const webRef      = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const token = session?.access_token;

  useFocusEffect(
    useCallback(() => {
      webRef.current?.injectJavaScript(buildNativeBridgeScript(token, TRUSTED_WEB_ORIGIN));
    }, [token])
  );

  const onShouldStartLoad = useCallback((request: { url: string }) => {
    if (isTrustedWebUrl(request.url, TRUSTED_WEB_ORIGIN)) return true;

    Linking.openURL(request.url).catch(() => {
      setError(`无法打开外部链接: ${request.url}`);
    });
    return false;
  }, []);

  const onMessage = useCallback((event: { nativeEvent: { data: string } }) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data) as {
        type: string;
        payload?: { route?: string };
      };
      if (msg.type === 'NAVIGATE' && msg.payload?.route) {
        const tab = ROUTE_MAP[msg.payload.route];
        if (tab) navigation.navigate(tab);
      }
    } catch { /* 非 JSON 忽略 */ }
  }, [navigation]);

  if (error) {
    return (
      <SafeAreaView style={styles.errWrap}>
        <Text style={styles.errIcon}>⚠️</Text>
        <Text style={styles.errTitle}>无法连接星图</Text>
        <Text style={styles.errSub}>{error}</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => { setError(null); webRef.current?.reload(); }}
        >
          <Text style={styles.retryText}>重新加载</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        source={{ uri: STAR_MAP_URL }}
        style={styles.webview}

        injectedJavaScriptBeforeContentLoaded={buildNativeBridgeScript(token, TRUSTED_WEB_ORIGIN)}
        injectedJavaScript={buildNativeBridgeScript(token, TRUSTED_WEB_ORIGIN)}

        onLoadStart={() => { setLoading(true); setError(null); }}
        onLoadEnd={()   =>  setLoading(false)}
        onError={({ nativeEvent }) => {
          setLoading(false);
          setError(nativeEvent.description || '未知错误');
        }}
        onShouldStartLoadWithRequest={onShouldStartLoad}
        onMessage={onMessage}

        allowsBackForwardNavigationGestures={false}
        pullToRefreshEnabled
        cacheEnabled
        domStorageEnabled
        javaScriptEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={COLORS.accent} size="large" />
          <Text style={styles.loadingText}>知识宇宙加载中...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  webview:   { flex: 1, backgroundColor: COLORS.bg },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.bg,
    alignItems:      'center',
    justifyContent:  'center',
    gap:             16,
  },
  loadingText: {
    color:       COLORS.textDim,
    fontSize:    13,
    fontFamily:  'monospace',
    letterSpacing: 1,
  },

  errWrap: {
    flex:            1,
    backgroundColor: COLORS.bg,
    alignItems:      'center',
    justifyContent:  'center',
    gap:             12,
    padding:         32,
  },
  errIcon:  { fontSize: 40 },
  errTitle: { color: COLORS.text,    fontSize: 16, fontWeight: '600' },
  errSub:   { color: COLORS.textDim, fontSize: 12, textAlign: 'center' },
  retryBtn: {
    marginTop:         8,
    backgroundColor:   COLORS.accentDim,
    borderRadius:      10,
    paddingHorizontal: 24,
    paddingVertical:   11,
    borderWidth:       1,
    borderColor:       COLORS.border,
  },
  retryText: { color: COLORS.accent, fontWeight: '600', fontSize: 14 },
});
