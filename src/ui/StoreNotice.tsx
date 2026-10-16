import { Megaphone, Store } from 'lucide-react';
import { useCatalog } from '../data/CatalogContext';
import { useLang } from '../i18n/LanguageContext';

/** "Not taking orders" when the owner closes the shop, and the owner's announcement. */
export function StoreNotice() {
  const { catalog } = useCatalog();
  const { t, pick } = useLang();
  if (!catalog) return null;
  const s = catalog.settings;
  const announcement = pick(s.announcementEn, s.announcementHi);
  const closedMessage = pick(s.closedMessageEn, s.closedMessageHi);

  return (
    <>
      {!s.storeOpen && (
        <div className="page mt-3">
          <div role="status" className="flex gap-3 rounded-panel bg-peach p-4 text-clay">
            <Store className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
            <div>
              <p className="font-semibold">{t('storeClosedTitle')}</p>
              {closedMessage && <p className="text-ink-soft">{closedMessage}</p>}
            </div>
          </div>
        </div>
      )}
      {announcement && (
        <div className="page mt-3">
          <div className="flex gap-3 rounded-panel bg-sage-mist p-4">
            <Megaphone className="mt-0.5 h-5 w-5 flex-none text-sage" aria-hidden="true" />
            <p>{announcement}</p>
          </div>
        </div>
      )}
    </>
  );
}
