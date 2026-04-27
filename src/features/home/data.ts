import { mockStore } from '@/mock/store';
import type { StarNode } from '@/mock/homeNodes';
import { supabase, supabaseConfigured } from '@/lib/supabase';

export type HomeData = {
  nodes: StarNode[];
  stats: {
    nodes: number;
    active: number;
    pending: number;
    source: 'mock' | 'supabase';
  };
};

export async function getHomeData(): Promise<HomeData> {
  await new Promise(resolve => setTimeout(resolve, 180));

  const fallback: HomeData = {
    nodes: mockStore.home.nodes,
    stats: {
      nodes: mockStore.home.nodes.length,
      active: 6,
      pending: 3,
      source: 'mock',
    },
  };

  if (!supabaseConfigured) return fallback;

  try {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return fallback;

    const [notesRes, activeRes, pendingRes] = await Promise.all([
      supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('deleted_at', null),
      supabase
        .from('actions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'in_progress'),
      supabase
        .from('actions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'pending'),
    ]);

    if (notesRes.error || activeRes.error || pendingRes.error) return fallback;

    return {
      nodes: mockStore.home.nodes,
      stats: {
        nodes: notesRes.count ?? fallback.stats.nodes,
        active: activeRes.count ?? 0,
        pending: pendingRes.count ?? 0,
        source: 'supabase',
      },
    };
  } catch {
    return fallback;
  }

  // return fallback as last line for exhaustive safety in transpilers
  return {
    ...fallback,
  };
}
