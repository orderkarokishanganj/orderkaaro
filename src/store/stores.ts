import { readJson } from '../lib/storage';
import type { Catalog } from '../data/catalog';
import { createStore } from './createStore';

/** Cart: variant id -> quantity. */
export type CartState = Record<string, number>;
export const cartStore = createStore<CartState>('ok_cart_v2', {});

export function setCartQuantity(variantId: string, quantity: number, max: number) {
  cartStore.set((cart) => {
    const next = { ...cart };
    const q = Math.min(Math.floor(quantity), Math.max(max, 0));
    if (q <= 0) delete next[variantId];
    else next[variantId] = q;
    return next;
  });
}

export const clearCart = () => cartStore.set({});

/** Wishlist: product ids. */
export const wishlistStore = createStore<string[]>('ok_wishlist_v2', []);
export const toggleWishlist = (productId: string) =>
  wishlistStore.set((list) => (list.includes(productId) ? list.filter((id) => id !== productId) : [productId, ...list]));

/** Saved delivery details, filled in automatically at the next checkout. */
export interface Profile {
  name: string;
  phone: string;
  address: string;
  landmark: string;
  pincode: string;
}
export const emptyProfile: Profile = { name: '', phone: '', address: '', landmark: '', pincode: '' };
export const profileStore = createStore<Profile>('ok_profile_v2', emptyProfile);

/** Past orders on this phone, newest first. */
export interface PastOrderLine {
  variantId: string;
  productId: string | null;
  nameEn: string;
  nameHi: string;
  unitEn: string;
  unitHi: string;
  quantity: number;
  unitPrice: number;
}
export interface PastOrder {
  /** Order number, or "WA-<time>" for orders sent on WhatsApp without being saved online. */
  ref: string;
  /** Null when the order went to WhatsApp without being saved online. */
  orderNumber: string | null;
  createdAt: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  lines: PastOrderLine[];
  whatsappText: string;
}
export const ordersStore = createStore<PastOrder[]>('ok_orders_v2', []);
export const addPastOrder = (order: PastOrder) => ordersStore.set((list) => [order, ...list].slice(0, 30));

/**
 * One-time move of carts, wishlists and addresses saved by the old site (keys order_kaaro_*),
 * matching old ids such as "P001" to the new variants. Items no longer sold are dropped.
 */
export function migrateLegacyData(catalog: Catalog) {
  if (readJson<boolean>('ok_legacy_migrated', false)) return;

  const byLegacy = new Map<string, { variantId: string; productId: string; max: number }>();
  for (const p of catalog.products) {
    for (const v of p.variants) {
      if (v.legacyId) byLegacy.set(v.legacyId.toUpperCase(), { variantId: v.id, productId: p.id, max: v.available ? v.maxQuantity : 0 });
    }
  }

  const oldCart = readJson<Record<string, number>>('order_kaaro_cart', {});
  if (Object.keys(cartStore.get()).length === 0) {
    const next: CartState = {};
    for (const [legacyId, qty] of Object.entries(oldCart)) {
      const match = byLegacy.get(legacyId.toUpperCase());
      if (match && match.max > 0 && qty > 0) next[match.variantId] = Math.min(qty, match.max);
    }
    if (Object.keys(next).length) cartStore.set(next);
  }

  const oldWishlist = readJson<string[]>('order_kaaro_wishlist', []);
  if (wishlistStore.get().length === 0 && Array.isArray(oldWishlist)) {
    const ids = [...new Set(oldWishlist.map((id) => byLegacy.get(String(id).toUpperCase())?.productId).filter((id): id is string => !!id))];
    if (ids.length) wishlistStore.set(ids);
  }

  const oldProfile = readJson<Partial<Profile>>('order_kaaro_profile', {});
  const current = profileStore.get();
  if (!current.name && !current.phone && (oldProfile.name || oldProfile.phone || oldProfile.address)) {
    profileStore.set({ ...emptyProfile, name: oldProfile.name ?? '', phone: oldProfile.phone ?? '', address: oldProfile.address ?? '' });
  }

  try {
    window.localStorage.setItem('ok_legacy_migrated', 'true');
  } catch {
    // Ignore: migration may run again next visit, which is harmless.
  }
}
