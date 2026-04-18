'use client';

import { useEffect } from 'react';

interface Options {
  onLeft?: () => void;
  onRight?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
}

export function useSwipeKeyboard({
  onLeft,
  onRight,
  onUp,
  onDown,
  onEnter,
  onEscape,
  enabled = true,
}: Options) {
  useEffect(() => {
    if (!enabled) return;

    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      switch (e.key) {
        case 'ArrowLeft':
          onLeft?.();
          break;
        case 'ArrowRight':
          onRight?.();
          break;
        case 'ArrowUp':
          e.preventDefault();
          onUp?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          onDown?.();
          break;
        case 'Enter':
          onEnter?.();
          break;
        case 'Escape':
          onEscape?.();
          break;
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onLeft, onRight, onUp, onDown, onEnter, onEscape, enabled]);
}
