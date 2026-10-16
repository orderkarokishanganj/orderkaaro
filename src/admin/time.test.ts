import { describe, expect, it } from 'vitest';
import { indiaInputToIso, isoToIndiaInput } from './time';

describe('India-time date inputs', () => {
  it('converts both ways regardless of the device timezone', () => {
    expect(indiaInputToIso('2026-10-31T23:59')).toBe('2026-10-31T18:29:00.000Z');
    expect(isoToIndiaInput('2026-10-31T18:29:00.000Z')).toBe('2026-10-31T23:59');
    expect(isoToIndiaInput(indiaInputToIso('2026-01-01T00:00'))).toBe('2026-01-01T00:00');
  });

  it('treats empty as no date', () => {
    expect(indiaInputToIso('')).toBeNull();
    expect(isoToIndiaInput(null)).toBe('');
  });
});
