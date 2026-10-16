import { describe, expect, it } from 'vitest';
import { formatTime, hoursStatus, indiaNow, parseHours, weeklySummary } from './hours';

const hours = parseHours({
  mon: { open: '09:00', close: '21:00' },
  tue: { open: '09:00', close: '21:00' },
  wed: { open: '09:00', close: '21:00' },
  thu: { open: '09:00', close: '21:00' },
  fri: { open: '09:00', close: '21:00' },
  sat: { open: '09:00', close: '21:00' },
  sun: { open: '10:00', close: '18:00' },
});

describe('hours', () => {
  it('uses India time, not the device clock', () => {
    // 2026-10-16 is a Friday. 03:00 UTC is 08:30 in India.
    expect(indiaNow(new Date('2026-10-16T03:00:00Z'))).toEqual({ day: 'fri', minutes: 8 * 60 + 30 });
    expect(hoursStatus(hours, new Date('2026-10-16T03:00:00Z')).openNow).toBe(false);
    expect(hoursStatus(hours, new Date('2026-10-16T04:00:00Z')).openNow).toBe(true); // 09:30
    expect(hoursStatus(hours, new Date('2026-10-16T15:30:00Z')).openNow).toBe(false); // 21:00
  });

  it('applies Sunday hours', () => {
    // Sunday 2026-10-18, 12:00 UTC = 17:30 India (open), 13:00 UTC = 18:30 (closed).
    expect(hoursStatus(hours, new Date('2026-10-18T12:00:00Z')).openNow).toBe(true);
    expect(hoursStatus(hours, new Date('2026-10-18T13:00:00Z')).openNow).toBe(false);
  });

  it('summarises the week in English and Hindi', () => {
    expect(weeklySummary(hours, 'en')).toEqual([
      { days: 'Mon–Sat', hours: '9 AM – 9 PM' },
      { days: 'Sun', hours: '10 AM – 6 PM' },
    ]);
    expect(weeklySummary(hours, 'hi')).toEqual([
      { days: 'सोम–शनि', hours: 'सुबह 9 बजे – रात 9 बजे' },
      { days: 'रवि', hours: 'सुबह 10 बजे – शाम 6 बजे' },
    ]);
  });

  it('formats times and ignores bad data', () => {
    expect(formatTime('13:30', 'en')).toBe('1:30 PM');
    expect(formatTime('00:00', 'en')).toBe('12 AM');
    expect(parseHours({ mon: { open: '9am', close: '21:00' } })).toEqual({});
  });
});
