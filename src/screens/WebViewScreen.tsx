import React, { useRef, useState, useCallback } from 'react';
import {
  View, StyleSheet,
  TouchableOpacity, Text, ActivityIndicator, Platform, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import type { WebViewNavigation } from 'react-native-webview';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuth } from '@/hooks/useAuth';
import { APP_CONFIG, COLORS } from '@/lib/constants';
import { buildNativeBridgeScript, getWebOrigin, isTrustedWebUrl } from '@/lib/nativeWebBridge';
import type { MainTabParams } from '@/navigation/types';

type Nav = BottomTabNavigationProp<MainTabParams>;
const TRUSTED_WEB_ORIGIN = getWebOrigin(APP_CONFIG.WEB_URL);

/**
 * 注入到网页的脚本：
 * - 传递 token，触发 pesta-native-auth 事件让网页跳过登录
 * - 暴露 window.pestaNativeNavigate(route) 供网页跳转原生 Tab
 */

// 支持的原生路由（网页端传的 route 字符串 → Tab name）
const ROUTE_MAP: Record<string, keyof MainTabParams> = {
  Capture: 'Capture',
  Search:  'Search',
  StarMap: 'StarMap',
  Insight: 'Insight',
  Memory: 'Memory',
  Action:  'Action',
  capture: 'Capture',
  search:  'Search',
  insight: 'Insight',
  memory: 'Memory',
  action:  'Action',
};

export default function WebViewScreen() {
  const { session } = useAuth();
  const navigation  = useNavigation<Nav>();
  const webRef      = useRef<WebView>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [curUrl,    setCurUrl]    = useState(APP_CONFIG.WEB_URL);

  const token = session?.access_token;

  // Tab 重新获得焦点时刷新注入（token 可能已刷新）
  useFocusEffect(
    useCallback(() => {
      webRef.current?.injectJavaScript(buildNativeBridgeScript(token, TRUSTED_WEB_ORIGIN));
    }, [token])
  );

  const onNavChange = (state: WebViewNavigation) => {
    setCanGoBack(state.canGoBack);
    setCurUrl(state.url);
  };

  const onShouldStartLoad = useCallback((request: { url: string }) => {
    if (isTrustedWebUrl(request.url, TRUSTED_WEB_ORIGIN)) return true;

    Linking.openURL(request.url).catch(() => {
      setError(`无法打开外部链接: ${request.url}`);
    });
    return false;
  }, []);

  // 接收网页 postMessage
  const onMessage = useCallback((event: { nativeEvent: { data: string } }) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data) as {
        type: string;
        payload?: { route?: string; params?: Record<string, unknown> };
      };

      if (msg.type === 'NAVIGATE' && msg.payload?.route) {
        const tab = ROUTE_MAP[msg.payload.route];
        if (tab) navigation.navigate(tab);
      }
    } catch { /* 非 JSON 消息忽略 */ }
  }, [navigation]);

  // ── 错误页 ─────────────────────────────────────────────────
  if (error) {
    return (
      <SafeAreaView style={styles.errWrap}>
        <Text style={styles.errIcon}>⚠️</Text>
        <Text style={styles.errTitle}>网络连接失败</Text>
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
    <SafeAreaView style={styles.safe}>
      {/* 顶部加载提示 */}
      {loading && (
        <View style={styles.loadBar}>
          <ActivityIndicator color={COLORS.accent} size="small" />
          <Text style={styles.loadText}>加载星图...</Text>
        </View>
      )}

      <WebView
        ref={webRef}
        source={{ uri: APP_CONFIG.WEB_URL }}
        style={styles.webview}

        injectedJavaScriptBeforeContentLoaded={buildNativeBridgeScript(token, TRUSTED_WEB_ORIGIN)}
        injectedJavaScript={buildNativeBridgeScript(token, TRUSTED_WEB_ORIGIN)}

        onLoadStart={() => { setLoading(true);  setError(null); }}
        onLoadEnd={()   =>   setLoading(false)}
        onError={({ nativeEvent }) => {
          setLoading(false);
          setError(nativeEvent.description || '未知错误');
        }}
        onShouldStartLoadWithRequest={onShouldStartLoad}
        onNavigationStateChange={onNavChange}
        onMessage={onMessage}

        allowsBackForwardNavigationGestures={Platform.OS === 'ios'}
        pullToRefreshEnabled
        cacheEnabled
        domStorageEnabled
        javaScriptEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
      />

      {/* 返回 / 刷新栏（仅在已向内导航时出现）*/}
      {canGoBack && (
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => webRef.current?.goBack()} style={styles.navBtn}>
            <Text style={styles.navBtnText}>← 返回</Text>
          </TouchableOpacity>
          <Text style={styles.urlText} numberOfLines={1}>
            {curUrl.replace(APP_CONFIG.WEB_URL, '~')}
          </Text>
          <TouchableOpacity onPress={() => webRef.current?.reload()} style={styles.navBtn}>
            <Text style={styles.navBtnText}>刷新</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.bg },
  webview: { flex: 1, backgroundColor: COLORS.bg },

  loadBar: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  loadText: { color: COLORS.textDim, fontSize: 12, fontFamily: 'monospace' },

  navBar: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.surface,
    borderTopWidth:  1,
    borderTopColor:  COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  navBtn:     { paddingHorizontal: 8, paddingVertical: 4 },
  navBtnText: { color: COLORS.accent, fontSize: 13 },
  urlText:    { flex: 1, color: COLORS.textDim, fontSize: 10, fontFamily: 'monospace' },

  errWrap: {
    flex:            1,
    backgroundColor: COLORS.bg,
    alignItems:      'center',
    justifyContent:  'center',
    gap:             12,
    padding:         32,
  },
  errIcon:  { fontSize: 40 },
  errTitle: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  errSub:   { color: COLORS.textDim, fontSize: 12, textAlign: 'center' },
  retryBtn: {
    marginTop:       8,
    backgroundColor: COLORS.accentDim,
    borderRadius:    10,
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderWidth:     1,
    borderColor:     COLORS.border,
  },
  retryText: { color: COLORS.accent, fontWeight: '600', fontSize: 14 },
});
