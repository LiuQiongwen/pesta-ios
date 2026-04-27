import { homeNodes, type StarNode } from './homeNodes';

export type CaptureItem = {
  id: string;
  kind: 'text' | 'url' | 'image';
  content: string;
  sourceUrl?: string;
};

export type SearchItem = {
  id: string;
  type: 'RAG' | 'URL' | 'NOTE' | 'IMAGE';
  text: string;
  sourceUrl?: string;
};

export type MemoryItem = {
  id: string;
  question: string;
};

export type ActionItem = {
  id: string;
  status: 'PENDING' | 'IN PROGRESS' | 'DONE';
  text: string;
};

export const mockStore: {
  home: { nodes: StarNode[] };
  capture: { recent: CaptureItem[] };
  search: { query: string; results: SearchItem[] };
  memory: { current: MemoryItem };
  action: { items: ActionItem[] };
} = {
  home: {
    nodes: homeNodes,
  },
  capture: {
    recent: [
      { id: 'c1', kind: 'text', content: 'Atomic habits notes...' },
      { id: 'c2', kind: 'url', content: 'https://example.com/design' },
      { id: 'c3', kind: 'image', content: 'Whiteboard snapshot for sprint plan' },
    ],
  },
  search: {
    query: 'What are key behavior change models?',
    results: [
      { id: 's1', type: 'RAG', text: 'Identity-based habits and feedback loops.' },
      { id: 's2', type: 'URL', text: 'Design psychology article snippet...' },
    ],
  },
  memory: {
    current: { id: 'm1', question: 'What is identity-based habit?' },
  },
  action: {
    items: [
      { id: 'a1', status: 'PENDING', text: 'Ship mobile tab shell' },
      { id: 'a2', status: 'IN PROGRESS', text: 'Add mock node sheet' },
      { id: 'a3', status: 'DONE', text: 'Set glassmorphism baseline' },
    ],
  },
};
