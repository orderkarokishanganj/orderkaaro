import { useState } from 'react';
import { Package } from 'lucide-react';
import type { Product } from '../data/catalog';
import { useLang } from '../i18n/LanguageContext';
import { productImageUrl } from '../lib/rest';

interface Props {
  product: Product;
  size?: 'thumb' | 'full';
  className?: string;
  dimmed?: boolean;
  eager?: boolean;
}

// React 18 doesn't know fetchPriority yet; the lowercase attribute passes straight through.
const HIGH_PRIORITY = { fetchpriority: 'high' } as object;

/**
 * Product photo, or a neutral placeholder when there is no photo or it fails to load.
 * size="full" shows the small copy first (often already downloaded from a product grid) and
 * swaps in the sharp 800px photo once it has arrived, so slow connections see the photo sooner.
 */
export function ProductImage({ product, size = 'thumb', className = '', dimmed = false, eager = false }: Props) {
  const { pick } = useLang();
  const [failed, setFailed] = useState(false);
  const [sharp, setSharp] = useState<string | null>(null);
  const image = product.images[0];
  const thumbSrc = image ? productImageUrl(image.path, 'thumb') : null;
  const fullSrc = image && size === 'full' ? productImageUrl(image.path, 'full') : null;
  const src = fullSrc && sharp === fullSrc ? fullSrc : thumbSrc;

  const onLoad = () => {
    if (!fullSrc || src === fullSrc) return;
    const big = new Image();
    big.onload = () => setSharp(fullSrc);
    big.src = fullSrc;
  };
  const onError = () => {
    // A missing small copy: try the full photo before giving up.
    if (fullSrc && src !== fullSrc) setSharp(fullSrc);
    else setFailed(true);
  };
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
      {...(eager && HIGH_PRIORITY)}
      decoding="async"
      width={size === 'thumb' ? 320 : 800}
      height={size === 'thumb' ? 320 : 800}
      onLoad={onLoad}
      onError={onError}
      className={`object-contain ${dimmed ? 'opacity-40' : ''} ${className}`}
    />
  );
}
