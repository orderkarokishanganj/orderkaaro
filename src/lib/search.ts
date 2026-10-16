// Product search that understands English, Hindi (Devanagari) and common Hinglish spellings,
// and forgives one typo in words of 5+ letters ("masoor" finds "Massor", "kabli" finds "Kabuli").

export interface Searchable {
  id: string;
  nameEn: string;
  nameHi: string;
  keywords: string[];
  categoryEn: string;
  categoryHi: string;
  sortOrder: number;
}

// Everyday words customers type in Hinglish, mapped to the spelling used in the catalogue.
const ALIASES: Record<string, string[]> = {
  aata: ['atta'],
  ata: ['atta'],
  daal: ['dal'],
  dhal: ['dal'],
  chawal: ['rice', 'chawal'],
  chaval: ['rice', 'chawal'],
  rice: ['chawal'],
  chini: ['sugar'],
  cheeni: ['sugar'],
  shakkar: ['sugar'],
  namak: ['salt'],
  tel: ['oil'],
  chai: ['tea'],
  chaipatti: ['tea'],
  patti: ['tea'],
  doodh: ['milk'],
  channa: ['chana'],
  chane: ['chana'],
  sabun: ['soap'],
  biskut: ['biscuit'],
  namkeen: ['bhujiya', 'chanachur', 'snacks'],
  masala: ['masala', 'powder'],
  haldi: ['turmeric'],
  mirch: ['mirchi'],
  jeera: ['geera', 'jeera'],
  zeera: ['geera', 'jeera'],
};

/** Lowercase, strip accents, unify Devanagari variants, keep letters and digits only. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // Latin accents
    .replace(/़/g, '') // Devanagari nukta: ज़ -> ज
    .replace(/ँ/g, 'ं') // chandrabindu -> anusvara
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ')
    .trim();
}

function tokens(text: string): string[] {
  return normalize(text).split(' ').filter(Boolean);
}

/** Edit distance, stopping early once it exceeds 1 (all we need). */
function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

/** How well one query word matches one product word: 3 exact, 2 prefix, 1 typo, 0 none. */
function wordScore(query: string, word: string): number {
  if (word === query) return 3;
  if (word.startsWith(query)) return 2;
  // Short words like "chai" are too close to others ("chak", "chan") to allow a typo.
  if (query.length >= 5 && (withinOneEdit(query, word) || withinOneEdit(query, word.slice(0, query.length)))) return 1;
  return 0;
}

interface IndexEntry<T extends Searchable> {
  item: T;
  nameWords: string[];
  otherWords: string[];
}

export function buildIndex<T extends Searchable>(items: T[]): IndexEntry<T>[] {
  return items.map((item) => ({
    item,
    nameWords: [...tokens(item.nameEn), ...tokens(item.nameHi)],
    otherWords: [...item.keywords.flatMap(tokens), ...tokens(item.categoryEn), ...tokens(item.categoryHi)],
  }));
}

/** Items matching every word of the query, best matches first. */
export function search<T extends Searchable>(index: IndexEntry<T>[], query: string, limit = 60): T[] {
  const queryWords = tokens(query);
  if (queryWords.length === 0) return [];

  const scored: Array<{ item: T; score: number }> = [];
  for (const entry of index) {
    let total = 0;
    let matchedAll = true;
    for (const q of queryWords) {
      const variants = [q, ...(ALIASES[q] ?? [])];
      let best = 0;
      for (const v of variants) {
        for (const w of entry.nameWords) best = Math.max(best, wordScore(v, w) * 2);
        for (const w of entry.otherWords) best = Math.max(best, wordScore(v, w));
      }
      if (best === 0) {
        matchedAll = false;
        break;
      }
      total += best;
    }
    if (matchedAll) scored.push({ item: entry.item, score: total });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.item.sortOrder - b.item.sortOrder)
    .slice(0, limit)
    .map((s) => s.item);
}
