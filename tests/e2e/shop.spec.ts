import { expect, test } from '@playwright/test';
import { addFirstProduct, fakePlaceOrder } from './helpers';

test('home page shows the shop, categories and products', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Everyday groceries from your neighbourhood store.');
  await expect(page.getByRole('heading', { name: 'Shop by category' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Add: / }).first()).toBeVisible();
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
  // English pages don't download the Hindi fonts.
  const fonts = await page.evaluate(() => performance.getEntriesByType('resource').map((r) => r.name).filter((n) => n.includes('.woff')));
  expect(fonts.some((n) => n.includes('devanagari'))).toBe(false);
});

test('search finds products and opens a product page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Search products' }).fill('dal');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/search\?q=dal/);
  await page.locator('main article').first().getByRole('link').first().click();
  await expect(page).toHaveURL(/\/product\//);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(JSON.parse(ld ?? '[]')[0]['@type']).toBe('Product');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/product\//);
});

test('cart shows server prices and the delivery fee', async ({ page }) => {
  await page.goto('/');
  const name = await addFirstProduct(page);
  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: 'Your cart' })).toBeVisible();
  await expect(page.getByText(name.split(' ').slice(0, 2).join(' ')).first()).toBeVisible();
  await expect(page.getByText('Delivery', { exact: true })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
});

test('checkout checks the form, then places the order', async ({ page }) => {
  const sent: Array<Record<string, unknown>> = [];
  await fakePlaceOrder(page, sent);
  await page.goto('/');
  await addFirstProduct(page);
  await page.goto('/checkout');
  await page.getByRole('button', { name: /^Place order/ }).click();
  await expect(page.getByText('Please enter your name.')).toBeVisible();
  await expect(page.getByLabel('Your name')).toBeFocused();

  await page.getByLabel('Your name').fill('TEST Playwright');
  await page.getByLabel('Mobile number').fill('9876543210');
  await page.getByLabel('Full address').fill('House 1, Test Road, Kishanganj');
  const pincode = page.getByLabel(/^Pincode/);
  if (await pincode.isVisible()) await pincode.fill('855107');
  await page.getByRole('button', { name: /^Place order/ }).click();

  await expect(page).toHaveURL(/\/order\/OK-E2E-001/);
  await expect(page.getByRole('heading', { name: 'Order placed' })).toBeVisible();
  await expect(page.getByText('OK-E2E-001')).toBeVisible();
  expect(sent).toHaveLength(1);
  expect(sent[0]).toMatchObject({ name: 'TEST Playwright', website: '' });
  expect(typeof sent[0].expected_total).toBe('number');
});

test('checkout offers WhatsApp when the system cannot be reached', async ({ page }) => {
  await page.route('**/rest/v1/rpc/place_order', (route) => route.abort('internetdisconnected'));
  // Record what WhatsApp link would open instead of opening it.
  await page.addInitScript(() => {
    const w = globalThis as unknown as { open: (url?: string | URL) => null; opened?: string };
    w.open = (url) => { w.opened = String(url); return null; };
  });
  await page.goto('/');
  await addFirstProduct(page);
  await page.goto('/checkout');
  await page.getByLabel('Your name').fill('TEST Playwright');
  await page.getByLabel('Mobile number').fill('9876543210');
  await page.getByLabel('Full address').fill('House 1, Test Road, Kishanganj');
  const pincode = page.getByLabel(/^Pincode/);
  if (await pincode.isVisible()) await pincode.fill('855107');
  await page.getByRole('button', { name: /^Place order/ }).click();
  await expect(page.getByText('We couldn’t reach our system')).toBeVisible();

  await page.getByRole('button', { name: 'Send on WhatsApp' }).click();
  const opened = await page.evaluate(() => (globalThis as unknown as { opened?: string }).opened ?? '');
  expect(opened).toMatch(/^https:\/\/wa\.me\/919942089120\?text=/);
  expect(decodeURIComponent(opened)).toContain('TEST Playwright');
  // Saved on the phone as not yet confirmed by the shop.
  await expect(page).toHaveURL(/\/order\/WA-/);
});

test('Hindi stays chosen after a reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'हिंदी' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('रोज़ का सामान, आपकी मोहल्ले की दुकान से।');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('रोज़ का सामान, आपकी मोहल्ले की दुकान से।');
});

test('robots.txt, sitemap and unknown pages', async ({ page, request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Disallow: /admin');
  expect(robots).toMatch(/Sitemap: http:\/\/localhost:4173\/sitemap\.xml/);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('<loc>http://localhost:4173/category/');
  await page.goto('/no-such-page');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
});

test('admin asks for a login', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole('heading', { name: 'Order Kaaro admin' })).toBeVisible();
});
