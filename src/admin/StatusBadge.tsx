import { STATUS, type OrderStatus } from './orderStatus';

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, icon: Icon, badge } = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}
    </span>
  );
}
