import { useState, type FormEvent } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { usePageTitle } from '../ui/usePageTitle';
import { useAdminAuth } from './auth';

export default function LoginPage() {
  const { state, signIn } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  usePageTitle('Admin login');

  if (state.status === 'ready') return <Navigate to="/admin" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(await signIn(email, password));
    setBusy(false);
  };

  const notice = state.status === 'signed-out' && state.reason === 'idle'
    ? 'You were signed out after 30 minutes without activity.'
    : state.status === 'signed-out' && state.reason === 'not-admin'
      ? 'This account is not an Order Kaaro admin. Ask the owner to add you.'
      : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-oat p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-6">
        <div className="text-center">
          <span className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-sage-mist text-sage"><Lock className="h-6 w-6" aria-hidden="true" /></span>
          <h1 className="text-2xl">Order Kaaro admin</h1>
        </div>
        {notice && <p role="status" className="rounded-2xl bg-peach p-3 text-sm text-clay">{notice}</p>}
        <div>
          <label htmlFor="admin-email" className="mb-1 block text-sm font-semibold">Email</label>
          <input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
        </div>
        <div>
          <label htmlFor="admin-password" className="mb-1 block text-sm font-semibold">Password</label>
          <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="field" />
        </div>
        {error && <p role="alert" className="text-sm font-semibold text-clay">{error}</p>}
        <button type="submit" disabled={busy || state.status === 'loading'} className="btn-primary w-full">
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Sign in
        </button>
        <p className="text-center text-sm">
          <Link to="/admin/reset-password" className="text-sage underline">Forgot password?</Link>
        </p>
      </form>
    </main>
  );
}
