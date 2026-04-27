import { mockStore, type SearchItem } from '@/mock/store';
import { supabase, supabaseConfigured } from '@/lib/supabase';

export type SearchData = {
  query: string;
  results: SearchItem[];
  source: 'mock' | 'supabase';
};

export async function getSearchData(): Promise<SearchData> {
  await new Promise(resolve => setTimeout(resolve, 140));

  const fallback: SearchData = {
    query: mockStore.search.query,
    results: mockStore.search.results,
    source: 'mock',
  };

  if (!supabaseConfigured) return fallback;

  try {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return fallback;

    const { data, error } = await supabase
      .from('notes')
      .select('id, content, source_type, source_url, attachment_url')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error || !data) return fallback;

    const results: SearchItem[] = data.map(row => {
      const sourceType = String(row.source_type ?? 'text').toLowerCase();
      const type: SearchItem['type'] =
        sourceType === 'image' ? 'IMAGE' : sourceType === 'url' ? 'URL' : 'NOTE';
      const sourceUrl =
        sourceType === 'image'
          ? (row.attachment_url ? String(row.attachment_url) : undefined)
          : sourceType === 'url'
            ? (row.source_url ? String(row.source_url) : undefined)
            : undefined;
      return {
        id: String(row.id),
        type,
        text: sourceUrl || String(row.content ?? ''),
        sourceUrl,
      };
    });

    return {
      query: 'Latest knowledge fragments',
      results,
      source: 'supabase',
    };
  } catch {
    return fallback;
  }
}
