import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { formatRupees } from '../lib/pricing';
import { readJson, writeJson } from '../lib/storage';
import { db } from './data';
import { useToast } from './ui';

interface AlertsValue {
  /** New orders that arrived while the admin was open and have not been looked at yet. */
  unseen: number;
  markSeen: () => void;
  /** Goes up whenever an order is added or changed, so lists can reload. */
  version: number;
  enabled: boolean;
  /** Must be called from a tap: phones only allow sound and notifications after one. */
  enable: () => Promise<void>;
  disable: () => void;
  notificationsBlocked: boolean;
}

const AlertsContext = createContext<AlertsValue | null>(null);
const PREF_KEY = 'ok_admin_alerts';

/** Two short rising tones, made in the browser (no sound file to download). */
function chime(ctx: AudioContext) {
  const now = ctx.currentTime;
  [880, 1320].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now + i * 0.18);
    gain.gain.exponentialRampToValueAtTime(0.4, now + i * 0.18 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.18 + 0.35);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + i * 0.18);
    osc.stop(now + i * 0.18 + 0.4);
  });
}

export function OrderAlertsProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [unseen, setUnseen] = useState(0);
  const [version, setVersion] = useState(0);
  const [enabled, setEnabled] = useState(() => readJson<boolean>(PREF_KEY, false));
  const [notificationsBlocked, setBlocked] = useState(() => typeof Notification !== 'undefined' && Notification.permission === 'denied');
  const audio = useRef<AudioContext | null>(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    const channel = db().channel('admin-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const order = payload.new as { order_number: string; customer_name: string; total: number };
        setUnseen((n) => n + 1);
        setVersion((v) => v + 1);
        toast('success', `New order ${order.order_number}: ${formatRupees(order.total)} from ${order.customer_name}`);
        if (!enabledRef.current) return;
        if (audio.current) {
          if (audio.current.state === 'suspended') audio.current.resume();
          chime(audio.current);
        }
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && document.visibilityState !== 'visible') {
          new Notification(`New order ${order.order_number}`, { body: `${formatRupees(order.total)} · ${order.customer_name}`, icon: '/logo.jpeg', tag: order.order_number });
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => setVersion((v) => v + 1))
      .subscribe();
    return () => {
      db().removeChannel(channel);
    };
  }, [toast]);

  const enable = useCallback(async () => {
    audio.current ??= new AudioContext();
    await audio.current.resume();
    chime(audio.current); // confirms it works, and unlocks sound on phones
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      setBlocked(result === 'denied');
    }
    setEnabled(true);
    writeJson(PREF_KEY, true);
  }, []);

  const disable = useCallback(() => {
    setEnabled(false);
    writeJson(PREF_KEY, false);
  }, []);

  // A saved "on" preference still needs one tap after a reload before sound can play.
  useEffect(() => {
    if (!enabled || audio.current) return;
    const unlock = () => {
      audio.current ??= new AudioContext();
      audio.current.resume();
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, [enabled]);

  const value = useMemo<AlertsValue>(() => ({
    unseen, markSeen: () => setUnseen(0), version, enabled, enable, disable, notificationsBlocked,
  }), [unseen, version, enabled, enable, disable, notificationsBlocked]);

  return <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOrderAlerts(): AlertsValue {
  const value = useContext(AlertsContext);
  if (!value) throw new Error('useOrderAlerts must be used inside OrderAlertsProvider');
  return value;
}
