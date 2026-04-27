import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  kind: string;
  sourceType: string;
  sourceUrl: string | null;
  attachmentUrl: string | null;
  done: boolean;
  createdAt: string;
}

function normalizeNote(row: Record<string, unknown>): NoteItem {
  const content = String(row.content ?? row.text ?? '');
  const title = String(row.title ?? '').trim() || content.slice(0, 36) || '未命名';
  const kind = String(row.kind ?? row.type ?? 'capture');
  return {
    id: String(row.id ?? `${Date.now()}`),
    title,
    content,
    kind,
    sourceType: String(row.source_type ?? kind),
    sourceUrl: row.source_url ? String(row.source_url) : null,
    attachmentUrl: row.attachment_url ? String(row.attachment_url) : null,
    done: Boolean(row.done ?? false),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

interface CreateNotePayload {
  content: string;
  kind?: string;
  title?: string;
  sourceType?: string;
  sourceUrl?: string | null;
  attachmentUrl?: string | null;
}

export function useNotes(userId?: string, universeId?: string | null) {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listNotes = useCallback(async (params?: { kind?: string; limit?: number }) => {
    if (!userId) {
      setNotes([]);
      return [] as NoteItem[];
    }
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (universeId) query = query.eq('universe_id', universeId);
      if (params?.kind) query = query.eq('kind', params.kind);
      if (params?.limit) query = query.limit(params.limit);

      const { data, error: queryError } = await query;
      if (queryError) throw queryError;
      const parsed = (data ?? []).map(item => normalizeNote(item as Record<string, unknown>));
      setNotes(parsed);
      return parsed;
    } catch (e) {
      const message = e instanceof Error ? e.message : '读取 notes 失败';
      setError(message);
      return [] as NoteItem[];
    } finally {
      setLoading(false);
    }
  }, [universeId, userId]);

  useEffect(() => {
    listNotes();
  }, [listNotes]);

  const instanceId = useRef(Math.random().toString(36).slice(2, 8));

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`notes:${userId}:${universeId ?? 'default'}:${instanceId.current}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notes', filter: `user_id=eq.${userId}` },
        payload => {
          const raw = payload.new as Record<string, unknown>;
          if (raw.deleted_at) return;
          if (universeId && raw.universe_id !== universeId) return;
          const next = normalizeNote(raw);
          setNotes(prev => (prev.some(n => n.id === next.id) ? prev : [next, ...prev]));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [universeId, userId]);

  const searchNotes = useCallback(async (keyword: string) => {
    const term = keyword.trim();
    if (!userId || !term) return [] as NoteItem[];

    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .or(`content.ilike.%${term}%,title.ilike.%${term}%`)
        .order('created_at', { ascending: false })
        .limit(40);
      if (universeId) query = query.eq('universe_id', universeId);
      const { data, error: queryError } = await query;

      if (queryError) throw queryError;
      return (data ?? []).map(item => normalizeNote(item as Record<string, unknown>));
    } catch (e) {
      const message = e instanceof Error ? e.message : '检索 notes 失败';
      setError(message);
      return [] as NoteItem[];
    } finally {
      setLoading(false);
    }
  }, [universeId, userId]);

  const createNote = useCallback(async (payload: CreateNotePayload) => {
    const text = payload.content.trim();
    const kind = payload.kind ?? 'capture';
    if (!userId) return { ok: false, message: '未登录' };
    if (!text) return { ok: false, message: '内容为空' };

    setLoading(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase.from('notes').insert({
        user_id: userId,
        universe_id: universeId ?? null,
        content: text,
        title: payload.title?.trim() || text.slice(0, 60),
        kind,
        source_type: payload.sourceType ?? kind,
        source_url: payload.sourceUrl ?? null,
        attachment_url: payload.attachmentUrl ?? null,
      }).select().maybeSingle();
      if (insertError) throw insertError;
      if (data) {
        const next = normalizeNote(data as Record<string, unknown>);
        setNotes(prev => (prev.some(n => n.id === next.id) ? prev : [next, ...prev]));
      }
      return { ok: true as const, message: null };
    } catch (e) {
      const message = e instanceof Error ? e.message : '写入 notes 失败';
      setError(message);
      return { ok: false as const, message };
    } finally {
      setLoading(false);
    }
  }, [universeId, userId]);

  return {
    notes,
    loading,
    error,
    listNotes,
    searchNotes,
    createNote,
  };
}
