import { CheckCircle2, Circle, PackageCheck, Truck, XCircle, type LucideIcon } from 'lucide-react';
import type { Enums } from '../lib/database.types';

export type OrderStatus = Enums<'order_status'>;

// Every status has an icon and a word, never colour alone.
export const STATUS: Record<OrderStatus, { label: string; icon: LucideIcon; badge: string }> = {
  new: { label: 'New', icon: Circle, badge: 'bg-peach text-clay' },
  confirmed: { label: 'Confirmed', icon: CheckCircle2, badge: 'bg-sage-mist text-sage-dark' },
  out_for_delivery: { label: 'Out for delivery', icon: Truck, badge: 'bg-sage-mist text-sage-dark' },
  delivered: { label: 'Delivered', icon: PackageCheck, badge: 'bg-sage text-white' },
  cancelled: { label: 'Cancelled', icon: XCircle, badge: 'bg-out-bg text-out-ink' },
};

/** The next step for each status (the database also allows skipping ahead, and cancelling). */
export const NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  new: 'confirmed',
  confirmed: 'out_for_delivery',
  out_for_delivery: 'delivered',
};

export const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  confirmed: 'Confirm order',
  out_for_delivery: 'Mark out for delivery',
  delivered: 'Mark delivered',
};

export const isOpen = (s: OrderStatus) => s === 'new' || s === 'confirmed' || s === 'out_for_delivery';

export function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' });
}
