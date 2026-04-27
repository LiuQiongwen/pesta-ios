import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '@/lib/constants';
import { useNotes } from '@/hooks/useNotes';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function CaptureScreen() {
  const { user } = useAuth();
  const [mode, setMode] = useState<'text' | 'url' | 'image'>('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [lastImageUrl, setLastImageUrl] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const { notes, createNote, listNotes, loading, error } = useNotes(user?.id, null);

  const activeValue = mode === 'text' ? text : mode === 'url' ? url : imageUri;
  const recentCaptures = useMemo(
    () =>
      notes
        .filter(n => ['capture', 'url', 'image'].includes((n.kind || '').toLowerCase()))
        .slice(0, 5),
    [notes]
  );

  useEffect(() => {
    listNotes({ limit: 5 });
  }, [listNotes]);

  const buildPayload = () => {
    if (mode === 'text') {
      return { kind: 'capture', content: text.trim() };
    }
    if (mode === 'url') {
      const normalized = url.trim();
      const isValid = /^https?:\/\/\S+/i.test(normalized);
      if (!isValid) return { kind: 'url', content: '', invalid: true as const };
      return { kind: 'url', content: normalized };
    }
    const normalized = imageUri.trim();
    const isValid = /^(https?:\/\/|file:\/\/|content:\/\/)/i.test(normalized);
    if (!isValid) return { kind: 'image', content: '', invalid: true as const };
    return { kind: 'image', content: normalized };
  };

  const submit = async () => {
    const payload = buildPayload();
    if (payload.invalid || !payload.content) return;

    let finalContent = payload.content;
    if (mode === 'image') {
      if (!user?.id) return;
      if (/^(file:\/\/|content:\/\/)/i.test(payload.content)) {
        setUploading(true);
        try {
          const path = `captures/${user.id}/${Date.now()}.jpg`;
          const resp = await fetch(payload.content);
          const blob = await resp.blob();
          const { error: upErr } = await supabase.storage
            .from('captures')
            .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
          if (upErr) {
            setCameraError(`上传失败: ${upErr.message}`);
            return;
          }
          const { data: urlData } = supabase.storage.from('captures').getPublicUrl(path);
          if (urlData?.publicUrl) finalContent = urlData.publicUrl;
        } finally {
          setUploading(false);
        }
      }
    }

    const content =
      mode === 'text'
        ? finalContent
        : mode === 'url'
          ? `[URL]\n${finalContent}`
          : `[IMAGE_URL]\n${finalContent}`;

    const res = await createNote(content, payload.kind);
    if (res.ok) {
      setText('');
      setUrl('');
      setImageUri('');
      if (mode === 'image') setLastImageUrl(finalContent);
      setSaved(true);
      listNotes({ limit: 5 });
      setTimeout(() => setSaved(false), 1400);
    }
  };

  const capturePhoto = async () => {
    setCameraError(null);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      setCameraError('未获得相机权限');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;
    setMode('image');
    setImageUri(result.assets[0].uri);
  };

  const pickPhotoFromLibrary = async () => {
    setCameraError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      setCameraError('未获得相册权限');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;
    setMode('image');
    setImageUri(result.assets[0].uri);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.label}>CAPTURE</Text>
            <Text style={styles.title}>捕获</Text>
            <Text style={styles.subtitle}>文本 / URL / 图片URI 三种输入</Text>
          </View>

          <View style={styles.modeRow}>
            {[
              { key: 'text', label: '文本' },
              { key: 'url', label: 'URL' },
              { key: 'image', label: '图片URI' },
            ].map(item => (
              <TouchableOpacity
                key={item.key}
                style={[styles.modeChip, mode === item.key && styles.modeChipActive]}
                onPress={() => setMode(item.key as 'text' | 'url' | 'image')}
              >
                <Text style={[styles.modeText, mode === item.key && styles.modeTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 输入区 */}
          <View style={styles.inputWrap}>
            {mode === 'text' ? (
              <TextInput
                style={styles.input}
                placeholder="输入想法、笔记、待整理内容..."
                placeholderTextColor={COLORS.textDim}
                value={text}
                onChangeText={setText}
                multiline
                autoFocus={false}
                textAlignVertical="top"
              />
            ) : (
              <TextInput
                style={styles.singleLineInput}
                placeholder={mode === 'url' ? 'https://example.com/...' : 'file://... 或 https://...'}
                placeholderTextColor={COLORS.textDim}
                value={mode === 'url' ? url : imageUri}
                onChangeText={mode === 'url' ? setUrl : setImageUri}
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
          </View>
          {mode === 'image' && (
            <>
              <View style={styles.imageActionRow}>
                <TouchableOpacity style={styles.cameraBtn} onPress={capturePhoto} activeOpacity={0.8}>
                  <Text style={styles.cameraBtnText}>拍照填充 URI</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cameraBtn} onPress={pickPhotoFromLibrary} activeOpacity={0.8}>
                  <Text style={styles.cameraBtnText}>相册选择</Text>
                </TouchableOpacity>
              </View>
              {imageUri.trim().length > 0 && (
                <Image source={{ uri: imageUri.trim() }} style={styles.previewImage} resizeMode="cover" />
              )}
            </>
          )}

          {/* 快捷类型 */}
          <View style={styles.typeRow}>
            {['想法', '链接', '文件', '图片'].map(t => (
              <TouchableOpacity key={t} style={styles.typeChip}>
                <Text style={styles.typeText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 提交 */}
          <TouchableOpacity
            style={[styles.submitBtn, (!activeValue.trim() || uploading) && styles.submitDisabled]}
            disabled={!activeValue.trim() || uploading}
            activeOpacity={0.8}
            onPress={submit}
          >
            <Text style={styles.submitText}>{loading || uploading ? '处理中...' : '送入宇宙 ✦'}</Text>
          </TouchableOpacity>
          {saved && <Text style={styles.successText}>已写入 Supabase</Text>}
          {saved && lastImageUrl && <Text style={styles.successText}>图片URL已保存</Text>}
          {!saved && mode === 'url' && url.trim().length > 0 && !/^https?:\/\/\S+/i.test(url.trim()) && (
            <Text style={styles.errorText}>URL 需以 http:// 或 https:// 开头</Text>
          )}
          {!saved && mode === 'image' && imageUri.trim().length > 0 && !/^(https?:\/\/|file:\/\/|content:\/\/)/i.test(imageUri.trim()) && (
            <Text style={styles.errorText}>图片URI需以 file:// / content:// / http(s):// 开头</Text>
          )}
          {cameraError && <Text style={styles.errorText}>相机错误: {cameraError}</Text>}
          {error && <Text style={styles.errorText}>写入失败: {error}</Text>}

          {/* Coming soon hint */}
          <View style={styles.hint}>
            <Text style={styles.hintText}>
              原生捕获界面开发中 · 完整功能请在「星图」中使用
            </Text>
          </View>

          <View style={styles.recentWrap}>
            <Text style={styles.recentTitle}>最近捕获</Text>
            {recentCaptures.length === 0 ? (
              <Text style={styles.recentEmpty}>暂无数据</Text>
            ) : (
              recentCaptures.map(item => (
                <View key={item.id} style={styles.recentItem}>
                  <Text style={styles.recentKind}>{(item.kind || 'capture').toUpperCase()}</Text>
                  <Text style={styles.recentText} numberOfLines={2}>
                    {item.content || item.title}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.bg },
  flex:    { flex: 1 },
  content: { padding: 24, gap: 20, paddingBottom: 40 },

  header: { gap: 4, marginBottom: 4 },
  label: {
    fontSize:      10,
    color:         COLORS.accent,
    fontFamily:    'monospace',
    letterSpacing: 3,
  },
  title: {
    fontSize:   28,
    fontWeight: '700',
    color:      COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color:    COLORS.textDim,
  },

  inputWrap: {
    backgroundColor: COLORS.surface,
    borderRadius:    14,
    borderWidth:     1,
    borderColor:     COLORS.border,
    padding:         16,
    minHeight:       160,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  modeChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  modeChipActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentDim,
  },
  modeText: { color: COLORS.textDim, fontSize: 12, fontFamily: 'monospace' },
  modeTextActive: { color: COLORS.accent, fontWeight: '600' },
  input: {
    color:      COLORS.text,
    fontSize:   15,
    lineHeight: 24,
    flex:       1,
    minHeight:  130,
  },
  singleLineInput: {
    color: COLORS.text,
    fontSize: 14,
    minHeight: 22,
  },
  cameraBtn: {
    marginTop: -6,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cameraBtnText: {
    color: COLORS.accent,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  imageActionRow: {
    marginTop: -6,
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  previewImage: {
    width: '100%',
    height: 180,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },

  typeRow: {
    flexDirection: 'row',
    gap:           10,
    flexWrap:      'wrap',
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical:   7,
    backgroundColor:   COLORS.surface,
    borderRadius:      20,
    borderWidth:       1,
    borderColor:       COLORS.border,
  },
  typeText: {
    color:     COLORS.textDim,
    fontSize:  12,
    fontFamily: 'monospace',
  },

  submitBtn: {
    backgroundColor: COLORS.accent,
    borderRadius:    12,
    paddingVertical: 15,
    alignItems:      'center',
  },
  submitDisabled: { opacity: 0.35 },
  submitText: {
    color:      COLORS.bg,
    fontWeight: '700',
    fontSize:   15,
    letterSpacing: 1,
  },

  hint: {
    alignItems: 'center',
    marginTop:  8,
  },
  hintText: {
    fontSize:   11,
    color:      'rgba(80,95,120,0.5)',
    fontFamily: 'monospace',
    textAlign:  'center',
    lineHeight: 18,
  },
  successText: { color: '#44ff99', fontSize: 12, textAlign: 'center', marginTop: -8 },
  errorText: { color: COLORS.error, fontSize: 12, textAlign: 'center', marginTop: -8 },
  recentWrap: {
    marginTop: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  recentTitle: {
    color: COLORS.textDim,
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 1.4,
  },
  recentEmpty: {
    color: COLORS.textDim,
    fontSize: 12,
  },
  recentItem: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    gap: 4,
  },
  recentKind: {
    color: COLORS.accent,
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1.2,
  },
  recentText: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 18,
  },
});
