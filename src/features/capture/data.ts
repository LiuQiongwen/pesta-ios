import { mockStore, type CaptureItem } from '@/mock/store';
import { supabase, supabaseConfigured } from '@/lib/supabase';

export type CaptureData = {
  recent: CaptureItem[];
  source: 'mock' | 'supabase';
};

export async function getCaptureData(): Promise<CaptureData> {
  await new Promise(resolve => setTimeout(resolve, 120));

  const fallback: CaptureData = {
    recent: mockStore.capture.recent,
    source: 'mock',
  };

  if (!supabaseConfigured) return fallback;

  try {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return fallback;

    const { data, error } = await supabase
      .from('notes')
      .select('id, content, source_type, source_url, attachment_url, kind')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(8);

    if (error || !data) return fallback;

    const recent: CaptureItem[] = data.map(row => {
      const sourceType = String(row.source_type ?? row.kind ?? 'text').toLowerCase();
      const kind: CaptureItem['kind'] =
        sourceType === 'image' ? 'image' : sourceType === 'url' ? 'url' : 'text';
      const sourceUrl =
        kind === 'image'
          ? (row.attachment_url ? String(row.attachment_url) : undefined)
          : kind === 'url'
            ? (row.source_url ? String(row.source_url) : undefined)
            : undefined;
      const content = sourceUrl || String(row.content ?? '');
      return {
        id: String(row.id),
        kind,
        content,
        sourceUrl,
      };
    });

    return {
      recent,
      source: 'supabase',
    };
  } catch {
    return fallback;
  }
}
