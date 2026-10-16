import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type AdminRole = 'owner' | 'staff';

type AuthState =
  | { status: 'loading' }
  | { status: 'signed-out'; reason?: 'idle' | 'not-admin' }
  | { status: 'ready'; session: Session; role: AdminRole; email: string };

interface AuthValue {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: (reason?: 'idle' | 'not-admin') => Promise<void>;
  sendResetLink: (email: string) => Promise<string | null>;
  setNewPassword: (password: string) => Promise<string | null>;
  /** True after opening the link from a password-reset email. */
  recovering: boolean;
}

const AuthContext = createContext<AuthValue | null>(null);

// Signed out automatically after this long without taps, typing or scrolling.
const IDLE_LIMIT_MS = 30 * 60 * 1000;
const ACTIVITY_KEY = 'ok_admin_last_active';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' });
  const [recovering, setRecovering] = useState(false);

  const resolve = useCallback(async (session: Session | null, reason?: 'idle' | 'not-admin') => {
    if (!supabase || !session) {
      setState({ status: 'signed-out', reason });
      return;
    }
    const { data: role, error } = await supabase.rpc('current_admin_role');
    if (error || !role) {
      // A real login, but not an admin: never keep it signed in here.
      await supabase.auth.signOut();
      setState({ status: 'signed-out', reason: 'not-admin' });
      return;
    }
    setState({ status: 'ready', session, role, email: session.user.email ?? '' });
  }, []);

  useEffect(() => {
    if (!supabase) {
      setState({ status: 'signed-out' });
      return;
    }
    const db = supabase;
    db.auth.getSession().then(({ data }) => resolve(data.session));
    const { data: sub } = db.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'PASSWORD_RECOVERY') resolve(session);
    });
    return () => sub.subscription.unsubscribe();
  }, [resolve]);

  const signOut = useCallback(async (reason?: 'idle' | 'not-admin') => {
    await supabase?.auth.signOut();
    setRecovering(false);
    setState({ status: 'signed-out', reason });
  }, []);

  // Auto-logout after inactivity, also across tabs and after the phone was asleep.
  useEffect(() => {
    if (state.status !== 'ready') return;
    const touch = () => {
      try {
        window.localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
      } catch {
        // Ignore.
      }
    };
    const lastActive = () => {
      try {
        return Number(window.localStorage.getItem(ACTIVITY_KEY)) || Date.now();
      } catch {
        return Date.now();
      }
    };
    touch();
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const;
    events.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    const check = () => {
      if (Date.now() - lastActive() > IDLE_LIMIT_MS) signOut('idle');
    };
    const timer = setInterval(check, 30 * 1000);
    document.addEventListener('visibilitychange', check);
    return () => {
      events.forEach((e) => window.removeEventListener(e, touch));
      clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
    };
  }, [state.status, signOut]);

  const value = useMemo<AuthValue>(() => ({
    state,
    recovering,
    signOut,
    signIn: async (email, password) => {
      if (!supabase) return 'The shop database is not configured.';
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      return error ? 'Wrong email or password.' : null;
    },
    sendResetLink: async (email) => {
      if (!supabase) return 'The shop database is not configured.';
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      return error ? error.message : null;
    },
    setNewPassword: async (password) => {
      if (!supabase) return 'The shop database is not configured.';
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return error.message;
      setRecovering(false);
      return null;
    },
  }), [state, recovering, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Provider and hook live together on purpose; this only affects dev hot reload.
// eslint-disable-next-line react-refresh/only-export-components
export function useAdminAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return value;
}
