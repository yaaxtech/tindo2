'use client';

import { create } from 'zustand';

import type { Task, CardAction } from '@/types/domain';

interface FeedState {
  deck: Task[];
  index: number;
  history: Array<{ task: Task; action: CardAction; at: number }>;

  setDeck: (tasks: Task[]) => void;
  current: () => Task | undefined;
  next: () => void;
  prev: () => void;
  pushHistory: (task: Task, action: CardAction) => void;
}

export const useFeed = create<FeedState>((set, get) => ({
  deck: [],
  index: 0,
  history: [],

  setDeck: (deck) => set({ deck, index: 0 }),
  current: () => get().deck[get().index],
  next: () =>
    set((s) => ({ index: Math.min(s.deck.length, s.index + 1) })),
  prev: () => set((s) => ({ index: Math.max(0, s.index - 1) })),
  pushHistory: (task, action) =>
    set((s) => ({
      history: [...s.history, { task, action, at: Date.now() }].slice(-100),
    })),
}));
