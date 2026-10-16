import { CATEGORY_ICONS } from '../lib/categoryIcons';

/** The icon the owner picked for a category, or nothing. */
export function CategoryIcon({ icon, className = 'h-4 w-4 text-sage' }: { icon: string | null; className?: string }) {
  const Icon = icon ? CATEGORY_ICONS[icon]?.icon : undefined;
  return Icon ? <Icon className={className} aria-hidden="true" /> : null;
}
