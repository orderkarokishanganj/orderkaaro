import { useState } from 'react';
import { Package } from 'lucide-react';
import type { Product } from '../data/catalog';
import { useLang } from '../i18n/LanguageContext';
import { productImageUrl } from '../lib/supabase';

interface Props {
  product: Product;
  size?: 'thumb' | 'full';
  className?: string;
  dimmed?: boolean;
  eager?: boolean;
}

/** Product photo, or a neutral placeholder when there is no photo or it fails to load. */
export function ProductImage({ product, size = 'thumb', className = '', dimmed = false, eager = false }: Props) {
  const { pick } = useLang();
  const [failed, setFailed] = useState(false);
  const image = product.images[0];
  const src = image ? productImageUrl(image.path, size) : null;
  const alt = image ? pick(image.altEn || product.nameEn, image.altHi || product.nameHi) : pick(product.nameEn, product.nameHi);

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center text-stone ${className}`} role="img" aria-label={alt}>
        <Package className="h-10 w-10" strokeWidth={1.5} aria-hidden="true" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      width={size === 'thumb' ? 320 : 800}
      height={size === 'thumb' ? 320 : 800}
      onError={() => setFailed(true)}
      className={`object-contain ${dimmed ? 'opacity-40' : ''} ${className}`}
    />
  );
}
