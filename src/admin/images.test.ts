import { describe, expect, it } from 'vitest';
import { newImagePath, thumbPath } from './images';

describe('newImagePath', () => {
  it('is always lowercase and safe, whatever the product name', () => {
    expect(newImagePath('Tata Salt', 'webp', 'AbC123')).toBe('products/tata-salt-abc123.webp');
    expect(newImagePath('Nilon’s Green-Chilly SAUCE (90 g)', 'jpg', 'x1')).toBe('products/nilon-s-green-chilly-sauce-90-g-x1.jpg');
    expect(newImagePath('आटा', 'webp', 'q9')).toBe('products/product-q9.webp');
  });

  it('matches the database rule for image paths', () => {
    const path = newImagePath('Kabuli Channa 1 kg', 'webp');
    expect(path).toMatch(/^[a-z0-9][a-z0-9/_.-]*$/);
    expect(thumbPath(path)).toMatch(/^thumbs\/products\/kabuli-channa-1-kg-[a-z0-9]+\.webp$/);
  });
});
