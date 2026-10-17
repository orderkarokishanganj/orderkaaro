import { useLang } from '../i18n/LanguageContext';

export function LanguageToggle() {
  const { lang, setLang, t } = useLang();
  const option = (value: 'en' | 'hi', label: string, className = '') => (
    <button
      type="button"
      lang={value}
      onClick={() => setLang(value)}
      aria-pressed={lang === value}
      className={`min-h-[40px] min-w-[52px] rounded-full px-3 text-sm font-semibold transition-colors ${className} ${
        lang === value ? 'bg-sage text-white' : 'text-sage hover:bg-sage-plate'
      }`}
    >
      {label}
    </button>
  );
  return (
    <div role="group" aria-label={t('language')} className="flex rounded-full bg-sage-mist p-0.5">
      {option('en', 'EN')}
      {/* Phone font: see fontFamily.system in tailwind.config.js */}
      {option('hi', 'हिंदी', 'font-system')}
    </div>
  );
}
