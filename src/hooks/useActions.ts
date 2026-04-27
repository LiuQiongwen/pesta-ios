import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Action {
  id: string;
  user_id: string;
  note_id: string | null;
  distillation_id: string | null;
  content: string;
  status: 'pending' | 'in_progress' | 'done' | 'dropped';
  priority: 'high' | 'normal' | 'low';
  source_context: string | null;
  outcome_note: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export function useActions(userId?: string) {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setActions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await supabase
        .from('actions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;
      setActions((data as Action[]) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : '读取 actions 失败');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = async (payload: Partial<Action>) => {
    if (!userId) return null;
    setError(null);
    const { data, error: insertError } = await supabase
      .from('actions')
      .insert({ ...payload, user_id: userId })
      .select()
      .maybeSingle();
    if (insertError) {
      setError(insertError.message);
      return null;
    }
    if (data) setActions(prev => [data as Action, ...prev]);
    return data as Action | null;
  };

  const update = async (id: string, patch: Partial<Action>) => {
    setError(null);
    const { data, error: updateError } = await supabase
      .from('actions')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (updateError) {
      setError(updateError.message);
      return null;
    }
    if (data) setActions(prev => prev.map(a => (a.id === id ? (data as Action) : a)));
    return data as Action | null;
  };

  const remove = async (id: string) => {
    setError(null);
    const { error: deleteError } = await supabase.from('actions').delete().eq('id', id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setActions(prev => prev.filter(a => a.id !== id));
  };

  return { actions, loading, error, create, update, remove, refresh };
}
