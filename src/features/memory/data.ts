import { mockStore, type MemoryItem } from '@/mock/store';
import { supabase, supabaseConfigured } from '@/lib/supabase';

export type MemoryData = {
  current: MemoryItem;
  queueSize: number;
  source: 'mock' | 'supabase';
};

export async function getMemoryData(): Promise<MemoryData> {
  await new Promise(resolve => setTimeout(resolve, 110));

  const fallback: MemoryData = {
    current: mockStore.memory.current,
    queueSize: 1,
    source: 'mock',
  };

  if (!supabaseConfigured) return fallback;

  try {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return fallback;

    const { data, error } = await supabase
      .from('notes')
      .select('id, title, content')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !data || data.length === 0) return fallback;

    const first = data[0];
    const questionSeed = String(first.title || first.content || '').trim();

    return {
      current: {
        id: String(first.id),
        question: questionSeed || 'What did you learn from your latest capture?',
      },
      queueSize: data.length,
      source: 'supabase',
    };
  } catch {
    return fallback;
  }
}
