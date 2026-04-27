import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

type Grade = 'again' | 'hard' | 'good' | 'easy';

interface CardState {
  intervalDays: number;
  ease: number;
  dueAt: string;
  reps: number;
  updatedAt: string;
}

type CardStateMap = Record<string, CardState>;

const BASE_INTERVALS: Record<Grade, number> = {
  again: 0,
  hard: 1,
  good: 2,
  easy: 4,
};

function getStorageKey(userId?: string) {
  return `memory:review:v1:${userId ?? 'anonymous'}`;
}

function nowIso() {
  return new Date().toISOString();
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString();
}

function isDue(dueAt: string) {
  return new Date(dueAt).getTime() <= Date.now();
}

function fromRemoteRow(row: Record<string, unknown>): CardState {
  return {
    intervalDays: Number(row.interval_days ?? 0),
    ease: Number(row.ease ?? 2.3),
    dueAt: String(row.due_at ?? nowIso()),
    reps: Number(row.reps ?? 0),
    updatedAt: String(row.updated_at ?? nowIso()),
  };
}

function pickNewerState(localState?: CardState, remoteState?: CardState): CardState | undefined {
  if (!localState) return remoteState;
  if (!remoteState) return localState;
  const localTs = new Date(localState.updatedAt).getTime();
  const remoteTs = new Date(remoteState.updatedAt).getTime();
  return remoteTs >= localTs ? remoteState : localState;
}

export function useMemoryReview(cardIds: string[], userId?: string) {
  const [stateMap, setStateMap] = useState<CardStateMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(getStorageKey(userId));
        const localMap = raw ? (JSON.parse(raw) as CardStateMap) : {};

        let remoteMap: CardStateMap = {};
        if (userId) {
          // Supabase sync is best-effort. If table is absent, fall back to local only.
          const { data } = await supabase
            .from('memory_reviews')
            .select('*')
            .eq('user_id', userId);
          if (Array.isArray(data)) {
            remoteMap = data.reduce<CardStateMap>((acc, row) => {
              const key = String((row as Record<string, unknown>).card_id ?? '');
              if (!key) return acc;
              acc[key] = fromRemoteRow(row as Record<string, unknown>);
              return acc;
            }, {});
          }
        }

        const merged = Object.keys({ ...localMap, ...remoteMap }).reduce<CardStateMap>((acc, key) => {
          const next = pickNewerState(localMap[key], remoteMap[key]);
          if (next) acc[key] = next;
          return acc;
        }, {});

        if (alive) setStateMap(merged);
      } catch {
        if (alive) setStateMap({});
      } finally {
        if (alive) setHydrated(true);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [userId]);

  const persist = useCallback(
    async (next: CardStateMap) => {
      setStateMap(next);
      await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(next));
    },
    [userId]
  );

  const syncRemote = useCallback(
    async (id: string, state: CardState) => {
      if (!userId) return;
      try {
        await supabase.from('memory_reviews').upsert(
          {
            user_id: userId,
            card_id: id,
            interval_days: state.intervalDays,
            ease: state.ease,
            due_at: state.dueAt,
            reps: state.reps,
            updated_at: nowIso(),
          },
          { onConflict: 'user_id,card_id' }
        );
      } catch {
        // Optional sync only; local schedule remains source of truth when remote unavailable.
      }
    },
    [userId]
  );

  const getCardState = useCallback(
    (id: string): CardState =>
      stateMap[id] ?? {
        intervalDays: 0,
        ease: 2.3,
        dueAt: nowIso(),
        reps: 0,
        updatedAt: nowIso(),
      },
    [stateMap]
  );

  const dueIds = useMemo(() => {
    if (!hydrated) return [] as string[];
    return cardIds.filter(id => isDue(getCardState(id).dueAt));
  }, [cardIds, getCardState, hydrated]);

  const rateCard = useCallback(
    async (id: string, grade: Grade) => {
      const prev = getCardState(id);
      const easeDelta = grade === 'again' ? -0.25 : grade === 'hard' ? -0.1 : grade === 'good' ? 0.05 : 0.15;
      const nextEase = Math.max(1.3, Math.min(3.0, prev.ease + easeDelta));
      const seed = BASE_INTERVALS[grade];
      const nextInterval =
        grade === 'again'
          ? 0
          : Math.max(seed, Math.round((prev.intervalDays || seed) * nextEase));
      const nextDueAt = grade === 'again' ? nowIso() : addDays(new Date(), nextInterval);

      const nextMap: CardStateMap = {
        ...stateMap,
        [id]: {
          intervalDays: nextInterval,
          ease: nextEase,
          dueAt: nextDueAt,
          reps: prev.reps + 1,
          updatedAt: nowIso(),
        },
      };
      await persist(nextMap);
      await syncRemote(id, nextMap[id]);
    },
    [getCardState, persist, stateMap, syncRemote]
  );

  const getSummary = useCallback(
    (id: string) => {
      const s = getCardState(id);
      return {
        intervalDays: s.intervalDays,
        dueAt: s.dueAt,
        reps: s.reps,
        updatedAt: s.updatedAt,
      };
    },
    [getCardState]
  );

  return {
    hydrated,
    dueIds,
    rateCard,
    getSummary,
  };
}
