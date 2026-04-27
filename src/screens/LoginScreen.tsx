import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { COLORS } from '@/lib/constants';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('提示', '请输入邮箱和密码');
      return;
    }
    setLoading(true);
    const err = await signIn(email.trim(), password);
    setLoading(false);
    if (err) Alert.alert('登录失败', err);
    // 成功后 RootNavigator 自动切换到 Main
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.logo}>✦ PESTA</Text>
          <Text style={styles.subtitle}>知识宇宙，从这里开始</Text>

          <TextInput
            style={styles.input}
            placeholder="邮箱"
            placeholderTextColor={COLORS.textDim}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <TextInput
            style={styles.input}
            placeholder="密码"
            placeholderTextColor={COLORS.textDim}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#000" size="small" />
              : <Text style={styles.btnText}>登录</Text>
            }
          </TouchableOpacity>

          <Text style={styles.hint}>还没有账号？请在网页端注册</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  kav:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: {
    width:           '100%',
    maxWidth:        360,
    backgroundColor: COLORS.surface,
    borderRadius:    20,
    borderWidth:     1,
    borderColor:     COLORS.border,
    padding:         28,
    gap:             14,
  },
  logo: {
    fontSize:      22,
    fontWeight:    '700',
    color:         COLORS.accent,
    fontFamily:    'monospace',
    letterSpacing: 4,
    textAlign:     'center',
  },
  subtitle: {
    fontSize:   12,
    color:      COLORS.textDim,
    textAlign:  'center',
    letterSpacing: 1,
    marginBottom: 4,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.10)',
    borderRadius:    10,
    padding:         13,
    color:           COLORS.text,
    fontSize:        14,
  },
  btn: {
    backgroundColor: COLORS.accent,
    borderRadius:    10,
    paddingVertical: 14,
    alignItems:      'center',
    marginTop:       4,
  },
  btnText: {
    color:      '#01040d',
    fontWeight: '700',
    fontSize:   15,
    letterSpacing: 1,
  },
  hint: {
    fontSize:   11,
    color:      COLORS.textDim,
    textAlign:  'center',
  },
});
