import { ChevronRight, History, Settings, ShieldCheck, Tag, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../ui/usePageTitle';
import { useAdminAuth } from './auth';

const SECTIONS = [
  { to: '/admin/customers', label: 'Customers', text: 'Everyone who has ordered, with totals. Export to CSV.', icon: Users, ownerOnly: false },
  { to: '/admin/coupons', label: 'Coupons', text: 'Discount codes, limits and how often they were used.', icon: Tag, ownerOnly: true },
  { to: '/admin/settings', label: 'Store settings', text: 'Delivery fees, hours, open/closed, announcement, contacts.', icon: Settings, ownerOnly: true },
  { to: '/admin/admins', label: 'Admin accounts', text: 'Who can use this panel, and as owner or staff.', icon: ShieldCheck, ownerOnly: true },
  { to: '/admin/activity', label: 'Activity log', text: 'Who changed what, and when.', icon: History, ownerOnly: true },
];

export default function MorePage() {
  const { state } = useAdminAuth();
  usePageTitle('More · Admin');
  const isOwner = state.status === 'ready' && state.role === 'owner';
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-[26px]">More</h1>
      <ul className="mt-4 space-y-2">
        {SECTIONS.filter((s) => isOwner || !s.ownerOnly).map(({ to, label, text, icon: Icon }) => (
          <li key={to}>
            <Link to={to} className="card flex items-center gap-3 p-4 hover:border-sage">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-sage-mist text-sage"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{label}</span>
                <span className="block text-sm text-stone">{text}</span>
              </span>
              <ChevronRight className="h-5 w-5 text-stone" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
      {!isOwner && <p className="mt-4 text-sm text-stone">Coupons, settings, admin accounts and the activity log are for the owner.</p>}
    </div>
  );
}
