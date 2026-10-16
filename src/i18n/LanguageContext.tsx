import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang } from '../lib/hours';
import { readJson, writeJson } from '../lib/storage';
import { en, hi, type StringKey } from './strings';

interface LanguageValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Interface text with {placeholders} filled in. */
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
  /** Picks the English or Hindi version of database text, falling back to English. */
  pick: (english: string, hindi: string | null | undefined) => string;
}

const LanguageContext = createContext<LanguageValue | null>(null);

function initialLang(): Lang {
  const saved = readJson<string | null>('ok_lang', null);
  if (saved === 'en' || saved === 'hi') return saved;
  // The old site stored a plain string under orderkaaro_lang.
  try {
    if (window.localStorage.getItem('orderkaaro_lang') === 'hi') return 'hi';
  } catch {
    // Ignore.
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    writeJson('ok_lang', next);
  }, []);

  const value = useMemo<LanguageValue>(() => {
    const dict = lang === 'hi' ? hi : en;
    return {
      lang,
      setLang,
      t: (key, vars) => {
        let text: string = dict[key] ?? en[key];
        if (vars) for (const [k, v] of Object.entries(vars)) text = text.split(`{${k}}`).join(String(v));
        return text;
      },
      pick: (english, hindi) => (lang === 'hi' && hindi ? hindi : english),
    };
  }, [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// Provider and hook live together on purpose; this only affects dev hot reload.
// eslint-disable-next-line react-refresh/only-export-components
export function useLang(): LanguageValue {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLang must be used inside LanguageProvider');
  return value;
}
