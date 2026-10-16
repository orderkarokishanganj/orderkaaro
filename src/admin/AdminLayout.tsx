import { Suspense } from 'react';
import { Bell, BellOff, ExternalLink, Home, LayoutGrid, LogOut, Menu, Package, Receipt } from 'lucide-react';
import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { useAdminAuth } from './auth';
import { OrderAlertsProvider, useOrderAlerts } from './OrderAlerts';
import { Spinner } from './ui';

const NAV = [
  { to: '/admin', label: 'Home', icon: Home, end: true },
  { to: '/admin/orders', label: 'Orders', icon: Receipt, end: false },
  { to: '/admin/products', label: 'Products', icon: Package, end: false },
  { to: '/admin/categories', label: 'Categories', icon: LayoutGrid, end: false },
  { to: '/admin/more', label: 'More', icon: Menu, end: false },
];

function AlertsButton() {
  const { enabled, enable, disable } = useOrderAlerts();
  return enabled ? (
    <button type="button" onClick={disable} className="flex h-11 w-11 items-center justify-center rounded-full text-sage hover:bg-oat" aria-label="Order alerts are on. Tap to turn off." title="Order alerts on">
      <Bell className="h-5 w-5" aria-hidden="true" />
    </button>
  ) : (
    <button type="button" onClick={enable} className="flex h-11 items-center gap-1 rounded-full bg-peach px-3 text-sm font-semibold text-clay hover:bg-oat">
      <BellOff className="h-5 w-5" aria-hidden="true" /> <span className="hidden sm:inline">Turn on order alerts</span><span className="sm:hidden">Alerts</span>
    </button>
  );
}

function Shell() {
  const { state, signOut } = useAdminAuth();
  const { unseen } = useOrderAlerts();
  if (state.status !== 'ready') return null;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 text-xs font-semibold md:flex-none md:flex-row md:gap-2 md:px-3 md:text-sm ${
      isActive ? 'bg-sage-mist text-sage' : 'text-stone hover:text-ink'
    }`;
  const links = NAV.map(({ to, label, icon: Icon, end }) => (
    <NavLink key={to} to={to} end={end} className={linkClass}>
      <Icon className="h-5 w-5" aria-hidden="true" /> {label}
      {to === '/admin/orders' && unseen > 0 && (
        <span className="absolute right-2 top-1 min-w-[20px] rounded-full bg-clay px-1 text-center text-[11px] leading-5 text-white md:static" aria-label={`${unseen} new`}>{unseen}</span>
      )}
    </NavLink>
  ));

  return (
    <div className="min-h-screen bg-oat pb-24 md:pb-8 print:bg-white print:pb-0">
      <header className="sticky top-0 z-30 border-b border-line bg-white print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold leading-tight">Order Kaaro admin</p>
            <p className="truncate text-xs text-stone">{state.email} · {state.role === 'owner' ? 'Owner' : 'Staff'}</p>
          </div>
          <nav aria-label="Admin" className="hidden gap-1 md:flex">{links}</nav>
          <div className="flex items-center gap-1">
            <AlertsButton />
            <a href="/" target="_blank" rel="noreferrer" className="flex h-11 w-11 items-center justify-center rounded-full text-stone hover:bg-oat" aria-label="Open the shop in a new tab">
              <ExternalLink className="h-5 w-5" aria-hidden="true" />
            </a>
            <button type="button" onClick={() => signOut()} className="flex h-11 w-11 items-center justify-center rounded-full text-stone hover:bg-oat sm:w-auto sm:gap-1 sm:px-3" aria-label="Sign out">
              <LogOut className="h-5 w-5" aria-hidden="true" /> <span className="hidden text-sm font-semibold sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pt-4 print:p-0">
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </main>
      <nav aria-label="Admin" className="fixed inset-x-0 bottom-0 z-30 flex print:hidden gap-1 border-t border-line bg-white px-1 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 md:hidden">{links}</nav>
    </div>
  );
}

export function AdminLayout() {
  const { state } = useAdminAuth();
  if (state.status === 'loading') return <Spinner />;
  if (state.status !== 'ready') return <Navigate to="/admin/login" replace />;
  return (
    <OrderAlertsProvider>
      <Shell />
    </OrderAlertsProvider>
  );
}
