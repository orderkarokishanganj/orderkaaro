import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';

const CHECK_EVERY_MS = 10 * 60 * 1000;

/**
 * Offers a refresh when a newer version has been deployed. The build writes /version.json;
 * this compares it with the version the page was built with.
 */
export function UpdatePrompt() {
  const { t } = useLang();
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (import.meta.env.DEV) return;
    let stopped = false;
    const check = async () => {
      if (stopped || document.visibilityState !== 'visible') return;
      try {
        const res = await fetch('/version.json', { cache: 'no-store' });
        if (!res.ok) return;
        const { version } = (await res.json()) as { version?: string };
        if (version && version !== __APP_VERSION__) setAvailable(true);
      } catch {
        // Offline: try again later.
      }
    };
    const first = setTimeout(check, 15000);
    const timer = setInterval(check, CHECK_EVERY_MS);
    document.addEventListener('visibilitychange', check);
    return () => {
      stopped = true;
      clearTimeout(first);
      clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
    };
  }, []);

  if (!available) return null;

  const refresh = async () => {
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      await reg?.update();
    } catch {
      // The reload below still fetches the new page (pages are network-first).
    }
    window.location.reload();
  };

  return (
    <div role="status" className="fixed inset-x-0 top-0 z-[70] flex justify-center p-2 print:hidden">
      <div className="flex max-w-md items-center gap-3 rounded-2xl bg-ink px-4 py-2 text-sm text-white shadow-float">
        <span>{t('updateAvailable')}</span>
        <button type="button" onClick={refresh} className="inline-flex min-h-[40px] flex-none items-center gap-1.5 rounded-full bg-white px-3 font-semibold text-ink">
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> {t('refresh')}
        </button>
        <button type="button" onClick={() => setAvailable(false)} className="min-h-[40px] flex-none px-1 text-white/80 underline" aria-label={t('updateLater')}>
          {t('updateLater')}
        </button>
      </div>
    </div>
  );
}
