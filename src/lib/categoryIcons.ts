import {
  Apple, Baby, Bean, Candy, Carrot, Coffee, Cookie, Droplet, Egg, Flame, Milk, Package, Popcorn,
  ShoppingBasket, Soup, Sparkles, SprayCan, Wheat, type LucideIcon,
} from 'lucide-react';

/** Icons the owner can pick for a category; the key is what is stored in categories.icon. */
export const CATEGORY_ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  wheat: { icon: Wheat, label: 'Grains' },
  bean: { icon: Bean, label: 'Dal' },
  droplet: { icon: Droplet, label: 'Oil' },
  coffee: { icon: Coffee, label: 'Tea / coffee' },
  cookie: { icon: Cookie, label: 'Biscuits' },
  popcorn: { icon: Popcorn, label: 'Snacks' },
  flame: { icon: Flame, label: 'Spices' },
  milk: { icon: Milk, label: 'Dairy' },
  'spray-can': { icon: SprayCan, label: 'Cleaning' },
  apple: { icon: Apple, label: 'Fruit' },
  carrot: { icon: Carrot, label: 'Vegetables' },
  egg: { icon: Egg, label: 'Eggs' },
  soup: { icon: Soup, label: 'Instant food' },
  candy: { icon: Candy, label: 'Sweets' },
  baby: { icon: Baby, label: 'Baby care' },
  sparkles: { icon: Sparkles, label: 'Personal care' },
  'shopping-basket': { icon: ShoppingBasket, label: 'General' },
  package: { icon: Package, label: 'Other' },
};
