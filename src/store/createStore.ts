import { useSyncExternalStore } from 'react';
import { readJson, writeJson } from '../lib/storage';

/** A tiny persisted store: state lives in localStorage and every tab stays in sync. */
export function createStore<T>(key: string, initial: T) {
  let state: T = readJson(key, initial);
  const listeners = new Set<() => void>();

  const emit = () => listeners.forEach((l) => l());

  const set = (next: T | ((prev: T) => T)) => {
    state = typeof next === 'function' ? (next as (prev: T) => T)(state) : next;
    writeJson(key, state);
    emit();
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === key) {
        state = readJson(key, initial);
        emit();
      }
    });
  }

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const get = () => state;
  const useValue = () => useSyncExternalStore(subscribe, get, get);

  return { get, set, subscribe, useValue };
}
