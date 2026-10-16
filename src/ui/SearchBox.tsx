import { useEffect, useState, type FormEvent } from 'react';
import { Search, X } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useLang } from '../i18n/LanguageContext';

/** Search pill in the header. On the search page it updates results as you type. */
export function SearchBox() {
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const onSearchPage = location.pathname === '/search';
  const [value, setValue] = useState(onSearchPage ? params.get('q') ?? '' : '');

  useEffect(() => {
    if (!onSearchPage) setValue('');
  }, [onSearchPage]);

  const go = (q: string, replace: boolean) => navigate(`/search?q=${encodeURIComponent(q)}`, { replace });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) go(value.trim(), onSearchPage);
    (document.activeElement as HTMLElement | null)?.blur();
  };

  return (
    <form role="search" onSubmit={submit} className="relative">
      <label htmlFor="site-search" className="sr-only">{t('searchLabel')}</label>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone" aria-hidden="true" />
      <input
        id="site-search"
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (onSearchPage) go(e.target.value, true);
        }}
        placeholder={t('searchPlaceholder')}
        className="h-[52px] w-full rounded-full border border-line bg-white pl-12 pr-12 text-base text-ink placeholder:text-stone focus:border-sage focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue('');
            if (onSearchPage) go('', true);
          }}
          className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-stone hover:text-ink"
          aria-label={t('remove')}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </form>
  );
}
