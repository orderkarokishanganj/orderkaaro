import { describe, expect, it } from 'vitest';
import { buildIndex, normalize, search, type Searchable } from './search';

const item = (id: string, nameEn: string, nameHi: string, categoryEn = 'Grocery', categoryHi = 'किराना', keywords: string[] = []): Searchable => ({
  id, nameEn, nameHi, keywords, categoryEn, categoryHi, sortOrder: Number(id.replace(/\D/g, '')),
});

const index = buildIndex([
  item('p1', 'Aashirvaad Shud Chakki Atta', 'आशीर्वाद शुद्ध चक्की आटा', 'Atta, Rice & Grains', 'आटा, चावल व अनाज'),
  item('p2', 'Premium Massor Dal', 'गोटा मसूर दाल', 'Pulses & Dal', 'दाल व चना'),
  item('p3', 'Tata Salt', 'टाटा नमक', 'Spices & Dry Fruits', 'मसाले व ड्राई फ्रूट्स'),
  item('p4', 'Sugar', 'चीनी / शक्कर', 'Atta, Rice & Grains', 'आटा, चावल व अनाज'),
  item('p5', 'Rajbari Tea Jar', 'राजबाड़ी चाय ज़ार', 'Tea & Beverages', 'चाय व पेय पदार्थ'),
  item('p6', 'Kabuli Channa', 'काबूली चना', 'Pulses & Dal', 'दाल व चना', ['chickpea', 'chole']),
]);
const ids = (q: string) => search(index, q).map((r) => r.id);

describe('search', () => {
  it('finds English names by prefix, ignoring case', () => {
    expect(ids('tata')).toEqual(['p3']);
    expect(ids('ATT')[0]).toBe('p1');
  });

  it('finds Hindi names, including nukta and spelling variants', () => {
    expect(ids('नमक')).toEqual(['p3']);
    expect(ids('जार')).toEqual(['p5']); // typed without the nukta of ज़ार
    expect(ids('मसूर')).toEqual(['p2']);
  });

  it('understands Hinglish words', () => {
    expect(ids('namak')).toEqual(['p3']);
    expect(ids('chini')).toEqual(['p4']);
    expect(ids('aata')[0]).toBe('p1');
    expect(ids('chai')).toEqual(['p5']);
  });

  it('forgives one typo in longer words', () => {
    expect(ids('masoor')).toEqual(['p2']);
    expect(ids('kabli')).toEqual(['p6']);
  });

  it('matches keywords and needs every word to match', () => {
    expect(ids('chole')).toEqual(['p6']);
    expect(ids('tata sugar')).toEqual([]);
    expect(ids('dal')).toEqual(expect.arrayContaining(['p2']));
  });

  it('ranks name matches above category matches', () => {
    expect(ids('dal')[0]).toBe('p2');
  });

  it('returns nothing for empty queries', () => {
    expect(ids('   ')).toEqual([]);
  });
});

describe('normalize', () => {
  it('strips punctuation and unifies Devanagari variants', () => {
    expect(normalize('Nilon’s  Green-Chilly')).toBe('nilon s green chilly');
    expect(normalize('ज़ार')).toBe(normalize('जार'));
  });
});
