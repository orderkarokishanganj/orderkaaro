import { Suspense } from 'react';
import { ExternalLink, LayoutGrid, LogOut, Package } from 'lucide-react';
import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { useAdminAuth } from './auth';
import { Spinner } from './ui';

// Sections appear here as they are built; nothing half-finished is linked.
const NAV = [
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: LayoutGrid },
];

export function AdminLayout() {
  const { state, signOut } = useAdminAuth();

  if (state.status === 'loading') return <Spinner />;
  if (state.status !== 'ready') return <Navigate to="/admin/login" replace />;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-3 text-xs font-semibold md:flex-none md:flex-row md:gap-2 md:text-sm ${
      isActive ? 'bg-sage-mist text-sage' : 'text-stone hover:text-ink'
    }`;

  return (
    <div className="min-h-screen bg-oat pb-24 md:pb-8">
      <header className="sticky top-0 z-30 border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold leading-tight">Order Kaaro admin</p>
            <p className="truncate text-xs text-stone">{state.email} · {state.role === 'owner' ? 'Owner' : 'Staff'}</p>
          </div>
          <nav aria-label="Admin" className="hidden gap-1 md:flex">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={linkClass}><Icon className="h-5 w-5" aria-hidden="true" /> {label}</NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <a href="/" target="_blank" rel="noreferrer" className="flex h-11 w-11 items-center justify-center rounded-full text-stone hover:bg-oat" aria-label="Open the shop in a new tab">
              <ExternalLink className="h-5 w-5" aria-hidden="true" />
            </a>
            <button type="button" onClick={() => signOut()} className="flex h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-stone hover:bg-oat">
              <LogOut className="h-5 w-5" aria-hidden="true" /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pt-4">
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </main>
      <nav aria-label="Admin" className="fixed inset-x-0 bottom-0 z-30 flex gap-1 border-t border-line bg-white px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 md:hidden">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass}><Icon className="h-5 w-5" aria-hidden="true" /> {label}</NavLink>
        ))}
      </nav>
    </div>
  );
}
