import { mockStore, type ActionItem } from '@/mock/store';
import { supabase, supabaseConfigured } from '@/lib/supabase';

export type ActionData = {
  items: ActionItem[];
  source: 'mock' | 'supabase';
};

export async function getActionData(): Promise<ActionData> {
  await new Promise(resolve => setTimeout(resolve, 130));

  const fallback: ActionData = {
    items: mockStore.action.items,
    source: 'mock',
  };

  if (!supabaseConfigured) return fallback;

  try {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return fallback;

    const { data, error } = await supabase
      .from('actions')
      .select('id, content, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error || !data) return fallback;

    const items: ActionItem[] = data.map(row => ({
      id: String(row.id),
      text: String(row.content ?? ''),
      status:
        row.status === 'in_progress'
          ? 'IN PROGRESS'
          : row.status === 'done'
            ? 'DONE'
            : 'PENDING',
    }));

    return {
      items,
      source: 'supabase',
    };
  } catch {
    return fallback;
  }
}
