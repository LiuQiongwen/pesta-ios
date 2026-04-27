export type StarNode = {
  id: string;
  title: string;
  type: 'idea' | 'url' | 'image' | 'task';
  x: number;
  y: number;
  summary: string;
  tags: string[];
};

export const homeNodes: StarNode[] = [
  {
    id: 'n1',
    title: 'Atomic Habits Notes',
    type: 'idea',
    x: 62,
    y: 74,
    summary: 'Habit loops and identity-based behavior design.',
    tags: ['behavior', 'book'],
  },
  {
    id: 'n2',
    title: 'Design References',
    type: 'url',
    x: 190,
    y: 112,
    summary: 'Glassmorphism layouts and premium dark UI examples.',
    tags: ['ui', 'reference'],
  },
  {
    id: 'n3',
    title: 'Whiteboard Photo',
    type: 'image',
    x: 130,
    y: 188,
    summary: 'Captured brainstorm snapshot to convert into notes.',
    tags: ['capture', 'image'],
  },
  {
    id: 'n4',
    title: 'Launch Checklist',
    type: 'task',
    x: 240,
    y: 228,
    summary: 'Release smoke tests, SQL migration, and QA signoff.',
    tags: ['action', 'release'],
  },
];
