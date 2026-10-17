import type { Page, Route } from '@playwright/test';

/**
 * Answers place_order in the browser instead of the database, so tests never create real orders.
 * Prices still come from the real server: the order is priced with quote_cart.
 */
export async function fakePlaceOrder(page: Page, sent: unknown[] = []) {
  await page.route('**/rest/v1/rpc/place_order', async (route: Route) => {
    const { p_order: order } = route.request().postDataJSON();
    sent.push(order);
    const quote = await route.fetch({
      url: route.request().url().replace('place_order', 'quote_cart'),
      postData: JSON.stringify({ p_items: order.items }),
    });
    const priced = await quote.json();
    await route.fulfill({
      json: {
        ...priced,
        order_id: '00000000-0000-0000-0000-000000000e2e',
        order_number: 'OK-E2E-001',
        created_at: new Date().toISOString(),
        name: order.name, phone: order.phone, address: order.address,
        landmark: order.landmark, pincode: order.pincode, notes: order.notes,
      },
    });
  });
}

/** Adds the first product on the page that can go in the cart; returns its button label. */
export async function addFirstProduct(page: Page): Promise<string> {
  const button = page.getByRole('button', { name: /^Add: / }).first();
  const label = (await button.getAttribute('aria-label')) ?? '';
  await button.click();
  return label.replace(/^Add: /, '');
}
