// <input type="datetime-local"> values are read and written in India time, whatever the phone's
// timezone, so "expires 31 Oct 23:59" means 23:59 in Kishanganj.

/** "2026-10-31T23:59" (India) -> ISO timestamp, or null when empty. */
export function indiaInputToIso(value: string): string | null {
  if (!value) return null;
  return new Date(`${value}:00+05:30`).toISOString();
}

/** ISO timestamp -> "2026-10-31T23:59" in India time, or "" when empty. */
export function isoToIndiaInput(iso: string | null): string {
  if (!iso) return '';
  const india = new Date(new Date(iso).getTime() + 330 * 60000);
  return india.toISOString().slice(0, 16);
}
