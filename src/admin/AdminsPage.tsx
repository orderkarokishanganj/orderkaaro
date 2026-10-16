import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Loader2, Trash2, UserPlus } from 'lucide-react';
import { usePageTitle } from '../ui/usePageTitle';
import { useAdminAuth, type AdminRole } from './auth';
import { db, errorText } from './data';
import { ConfirmDialog, Spinner, useToast } from './ui';

interface Admin {
  user_id: string;
  email: string;
  role: AdminRole;
  display_name: string;
}

export default function AdminsPage() {
  const { state } = useAdminAuth();
  const toast = useToast();
  usePageTitle('Admin accounts · Admin');
  const isOwner = state.status === 'ready' && state.role === 'owner';
  const myEmail = state.status === 'ready' ? state.email : '';
  const [admins, setAdmins] = useState<Admin[] | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<AdminRole>('staff');
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState<Admin | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await db().rpc('admin_list_admins');
    if (error) toast('error', errorText(error));
    else setAdmins(data);
  }, [toast]);
  useEffect(() => {
    if (isOwner) load();
  }, [load, isOwner]);

  if (!isOwner) return <p className="card p-6 text-center">Only the owner can manage admin accounts.</p>;
  if (!admins) return <Spinner />;

  const friendly = (message: string) => ({
    USER_NOT_FOUND: 'No login with that email yet. Create it first in Supabase (see the steps above), then add it here.',
    LAST_OWNER: 'The shop must always have at least one owner. Make someone else an owner first.',
  } as Record<string, string>)[message] ?? errorText({ message });

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return toast('error', 'Enter the person’s login email.');
    setBusy(true);
    const { error } = await db().rpc('admin_add_admin', { p_email: email, p_role: role, p_name: name });
    setBusy(false);
    if (error) return toast('error', friendly(error.message));
    toast('success', `${email.trim()} can now use the admin panel as ${role}.`);
    setEmail('');
    setName('');
    load();
  };

  const changeRole = async (a: Admin, next: AdminRole) => {
    const { error } = await db().from('admin_users').update({ role: next }).eq('user_id', a.user_id);
    if (error) return toast('error', friendly(error.message));
    toast('success', `${a.email} is now ${next}.`);
    load();
  };

  const remove = async () => {
    if (!removing) return;
    setBusy(true);
    const { error } = await db().from('admin_users').delete().eq('user_id', removing.user_id);
    setBusy(false);
    if (error) return toast('error', friendly(error.message));
    toast('success', `${removing.email} can no longer use the admin panel.`);
    setRemoving(null);
    load();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-[26px]">Admin accounts</h1>

      <ul className="space-y-2">
        {admins.map((a) => (
          <li key={a.user_id} className="card flex flex-wrap items-center justify-between gap-2 p-3">
            <div className="min-w-0">
              <p className="font-semibold">{a.display_name || a.email}{a.email === myEmail && <span className="ml-1 text-sm font-normal text-stone">(you)</span>}</p>
              <p className="truncate text-sm text-stone">{a.email}</p>
            </div>
            <div className="flex items-center gap-1">
              <label>
                <span className="sr-only">Role for {a.email}</span>
                <select value={a.role} onChange={(e) => changeRole(a, e.target.value as AdminRole)} className="field py-2">
                  <option value="owner">Owner</option>
                  <option value="staff">Staff</option>
                </select>
              </label>
              <button type="button" onClick={() => setRemoving(a)} className="flex h-11 w-11 items-center justify-center rounded-full text-danger-ink hover:bg-danger-bg" aria-label={`Remove ${a.email}`}>
                <Trash2 className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <section className="card space-y-3 p-4" aria-labelledby="add-title">
        <h2 id="add-title" className="text-lg">Add someone</h2>
        <ol className="ml-5 list-decimal space-y-1 text-sm text-ink-soft">
          <li>In Supabase, open Authentication → Users → Add user → Create new user. Enter their email and a password, and tick “Auto Confirm User”.</li>
          <li>Add the same email below. Give them the password privately; they can change it with “Forgot password?”.</li>
        </ol>
        <p className="text-sm text-stone"><strong>Staff</strong> manage orders, products, stock and categories. <strong>Owners</strong> also manage coupons, settings, admins and the activity log.</p>
        <form onSubmit={add} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
          <label><span className="mb-1 block text-sm font-semibold">Login email</span><input type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label><span className="mb-1 block text-sm font-semibold">Name (optional)</span><input className="field" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label><span className="mb-1 block text-sm font-semibold">Role</span>
            <select className="field" value={role} onChange={(e) => setRole(e.target.value as AdminRole)}><option value="staff">Staff</option><option value="owner">Owner</option></select>
          </label>
          <button type="submit" className="btn-primary" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <UserPlus className="h-5 w-5" aria-hidden="true" />} Add</button>
        </form>
      </section>

      <ConfirmDialog
        open={removing !== null}
        title={`Remove ${removing?.email ?? ''}?`}
        text="They will no longer be able to use the admin panel. Their login still exists in Supabase; delete it there if needed."
        confirmLabel="Remove access"
        danger
        busy={busy}
        onConfirm={remove}
        onCancel={() => setRemoving(null)}
      />
    </div>
  );
}
