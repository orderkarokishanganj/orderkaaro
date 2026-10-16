// Store hours from settings.store_hours, always judged in India time whatever the phone's clock says.

export type Lang = 'en' | 'hi';
export const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type DayKey = (typeof DAYS)[number];
export interface DayHours {
  open: string;
  close: string;
}
export type StoreHours = Partial<Record<DayKey, DayHours>>;

const DAY_LABEL: Record<Lang, Record<DayKey, string>> = {
  en: { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' },
  hi: { mon: 'सोम', tue: 'मंगल', wed: 'बुध', thu: 'गुरु', fri: 'शुक्र', sat: 'शनि', sun: 'रवि' },
};

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parseHours(value: unknown): StoreHours {
  const out: StoreHours = {};
  if (typeof value !== 'object' || value === null) return out;
  for (const day of DAYS) {
    const d = (value as Record<string, unknown>)[day] as Partial<DayHours> | undefined;
    if (d && typeof d.open === 'string' && typeof d.close === 'string' && TIME.test(d.open) && TIME.test(d.close)) {
      out[day] = { open: d.open, close: d.close };
    }
  }
  return out;
}

const toMinutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

/** Day and minutes since midnight in Asia/Kolkata. */
export function indiaNow(date = new Date()): { day: DayKey; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const day = get('weekday').slice(0, 3).toLowerCase() as DayKey;
  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

export function hoursStatus(hours: StoreHours, date = new Date()): { openNow: boolean; today: DayHours | null } {
  const { day, minutes } = indiaNow(date);
  const today = hours[day] ?? null;
  const openNow = !!today && minutes >= toMinutes(today.open) && minutes < toMinutes(today.close);
  return { openNow, today };
}

export function formatTime(hhmm: string, lang: Lang): string {
  const h = Number(hhmm.slice(0, 2));
  const m = hhmm.slice(3, 5);
  const h12 = h % 12 || 12;
  const clock = m === '00' ? `${h12}` : `${h12}:${m}`;
  if (lang === 'en') return `${clock} ${h < 12 ? 'AM' : 'PM'}`;
  const part = h < 12 ? 'सुबह' : h < 16 ? 'दोपहर' : h < 19 ? 'शाम' : 'रात';
  return `${part} ${clock} बजे`;
}

export function formatRange(d: DayHours, lang: Lang): string {
  return `${formatTime(d.open, lang)} – ${formatTime(d.close, lang)}`;
}

/** Groups days with the same hours: [{ days: 'Mon–Sat', hours: '9 AM – 9 PM' }, ...]. */
export function weeklySummary(hours: StoreHours, lang: Lang): Array<{ days: string; hours: string }> {
  const rows: Array<{ from: DayKey; to: DayKey; key: string }> = [];
  for (const day of DAYS) {
    const d = hours[day];
    const key = d ? `${d.open}-${d.close}` : 'closed';
    const last = rows[rows.length - 1];
    if (last && last.key === key) last.to = day;
    else rows.push({ from: day, to: day, key });
  }
  return rows.map((r) => {
    const label = DAY_LABEL[lang];
    const days = r.from === r.to ? label[r.from] : `${label[r.from]}–${label[r.to]}`;
    const d = hours[r.from];
    return { days, hours: d ? formatRange(d, lang) : lang === 'hi' ? 'बंद' : 'Closed' };
  });
}
