import { expect, Page } from '@playwright/test';
import { loginHelper } from '../../fixtures/login';

// Minimal subset of ClientConfig used by helpers — matches tests/e2e/fixtures/clients.ts
interface ClientConfig {
  name: string;
  baseURL: string;
  loginPath: string;
  credentials: { email: string; password: string };
  config: Record<string, any>;
}

/**
 * Navigates to the client's base URL and logs in if the client requires authentication.
 * Extracted from the loginIfNeeded closure in config-validation.spec.ts (lines 17-23).
 */
export async function loginIfNeeded(page: Page, client: ClientConfig): Promise<void> {
  await page.goto(client.baseURL);
  await page.waitForLoadState('domcontentloaded');
  if (!client.config.anonymousAccess) {
    await loginHelper(page, client.credentials.email, client.credentials.password, client.loginPath, client.baseURL);
  }
}

/**
 * Navigates to /products, adds the first product to the cart, then navigates to /cart.
 * Extracted from the addOneProductToCart closure in config-validation.spec.ts (lines 594-604).
 */
export async function addOneProductToCart(page: Page, client: ClientConfig): Promise<void> {
  await page.goto(`${client.baseURL}/products`);
  await page.waitForLoadState('domcontentloaded');
  const addBtn = page.getByRole('button', { name: 'Agregar' }).first();
  await expect(addBtn).toBeVisible({ timeout: 20_000 });
  await addBtn.click();
  await page.waitForTimeout(800);
  await page.goto(`${client.baseURL}/cart`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
}
