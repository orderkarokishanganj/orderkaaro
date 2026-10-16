import { useState, type FormEvent } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePageTitle } from '../ui/usePageTitle';
import { useAdminAuth } from './auth';

/** Step 1: ask for a reset email. Step 2 (after opening the email link): choose a new password. */
export default function ResetPasswordPage() {
  const { recovering, state, sendResetLink, setNewPassword } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  usePageTitle('Reset password');

  const choosing = recovering && state.status === 'ready';

  const requestLink = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const error = await sendResetLink(email);
    setBusy(false);
    // Same message either way, so the page never reveals which emails are admins.
    setMessage(error && !/rate/i.test(error)
      ? { kind: 'error', text: 'Could not send the email. Please try again in a few minutes.' }
      : { kind: 'ok', text: 'If that email belongs to an admin, a reset link is on its way. Open it on this device.' });
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 10) return setMessage({ kind: 'error', text: 'Use at least 10 characters.' });
    if (password !== confirm) return setMessage({ kind: 'error', text: 'The two passwords do not match.' });
    setBusy(true);
    const error = await setNewPassword(password);
    setBusy(false);
    if (error) return setMessage({ kind: 'error', text: error });
    navigate('/admin', { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-oat p-4">
      <form onSubmit={choosing ? save : requestLink} className="card w-full max-w-sm space-y-4 p-6">
        <div className="text-center">
          <span className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-sage-mist text-sage"><KeyRound className="h-6 w-6" aria-hidden="true" /></span>
          <h1 className="text-2xl">{choosing ? 'Choose a new password' : 'Reset password'}</h1>
        </div>
        {choosing ? (
          <>
            <div>
              <label htmlFor="new-password" className="mb-1 block text-sm font-semibold">New password</label>
              <input id="new-password" type="password" autoComplete="new-password" minLength={10} required value={password} onChange={(e) => setPassword(e.target.value)} className="field" />
              <p className="mt-1 text-xs text-stone">At least 10 characters.</p>
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-1 block text-sm font-semibold">Type it again</label>
              <input id="confirm-password" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="field" />
            </div>
          </>
        ) : (
          <div>
            <label htmlFor="reset-email" className="mb-1 block text-sm font-semibold">Your admin email</label>
            <input id="reset-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
          </div>
        )}
        {message && (
          <p role={message.kind === 'error' ? 'alert' : 'status'} className={`text-sm font-semibold ${message.kind === 'error' ? 'text-clay' : 'text-sage'}`}>{message.text}</p>
        )}
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} {choosing ? 'Save password' : 'Send reset link'}
        </button>
        <p className="text-center text-sm"><Link to="/admin/login" className="text-sage underline">Back to sign in</Link></p>
      </form>
    </main>
  );
}
