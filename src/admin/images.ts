import { db, slugify } from './data';

const BUCKET = 'product-images';
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

/** A new, unique, all-lowercase Storage path, e.g. products/tata-salt-k3x9qa.webp. */
export function newImagePath(productName: string, ext: 'webp' | 'jpg', random = Math.random().toString(36).slice(2, 8)): string {
  const base = slugify(productName) || 'product';
  return `products/${base}-${random.toLowerCase().replace(/[^a-z0-9]/g, '')}.${ext}`;
}

/** Thumbnail path for any image path (used for product grids). */
export const thumbPath = (path: string) => `thumbs/${path}`;

async function resize(bitmap: ImageBitmap, size: number, quality: number): Promise<Blob> {
  const scale = Math.min(1, size / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser cannot process photos.');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
  // Older iPhones cannot make WebP; JPEG is the fallback.
  if (blob && blob.type === 'image/webp') return blob;
  const jpeg = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  if (!jpeg) throw new Error('Could not process this photo.');
  return jpeg;
}

/**
 * Resizes a photo on the phone (800px and a 320px thumbnail, WebP where supported) and uploads both.
 * Returns the Storage path to save on the product.
 */
export async function uploadProductImage(file: File, productName: string): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not a photo.`);
  if (file.size > MAX_UPLOAD_BYTES) throw new Error(`${file.name} is larger than 20 MB.`);
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => {
    throw new Error(`${file.name} could not be opened. Try a JPEG or PNG photo.`);
  });
  const full = await resize(bitmap, 800, 0.8);
  const thumb = await resize(bitmap, 320, 0.75);
  bitmap.close();

  const ext = full.type === 'image/webp' ? 'webp' : 'jpg';
  const path = newImagePath(productName, ext);
  const storage = db().storage.from(BUCKET);
  const options = { contentType: full.type, cacheControl: '31536000', upsert: false };
  const a = await storage.upload(path, full, options);
  if (a.error) throw new Error(`Upload failed: ${a.error.message}`);
  const b = await storage.upload(thumbPath(path), thumb, { ...options, contentType: thumb.type });
  if (b.error) {
    await storage.remove([path]);
    throw new Error(`Upload failed: ${b.error.message}`);
  }
  return path;
}

/** Deletes photos (and their thumbnails) that no product uses any more. Failures are only logged. */
export async function removeImages(paths: string[]): Promise<void> {
  if (!paths.length) return;
  const { error } = await db().storage.from(BUCKET).remove(paths.flatMap((p) => [p, thumbPath(p)]));
  if (error) console.warn('Could not delete unused photos', error.message);
}
