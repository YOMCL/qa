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

/**
 * Clears the cart before cart-feature tests to prevent server-side state conflicts
 * when multiple workers share the same client credentials concurrently.
 * Best-effort: never fails the test if clearing errors.
 */
export async function clearCartForTest(page: Page, client: ClientConfig): Promise<void> {
  try {
    await page.goto(`${client.baseURL}/cart`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2_000);

    // Strategy 1: "Eliminar todos" / "Limpiar carrito" / "Vaciar" button
    const deleteAllSelectors = [
      page.getByRole('button', { name: /eliminar todos/i }),
      page.getByRole('button', { name: /limpiar carrito/i }),
      page.getByRole('button', { name: /vaciar carrito/i }),
      page.getByText(/eliminar todos/i),
    ];
    for (const btn of deleteAllSelectors) {
      if (await btn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(1_500);
        const confirm = page.getByRole('button', { name: /confirmar|aceptar|sí|yes/i });
        if (await confirm.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await confirm.click();
          await page.waitForTimeout(1_000);
        }
        return;
      }
    }

    // Strategy 2: per-item delete buttons
    const deleteButtons = page.locator(
      '[aria-label*="eliminar" i], [aria-label*="delete" i], [aria-label*="remove" i], button[class*="delete" i], button[class*="trash" i]'
    );
    const count = await deleteButtons.count();
    for (let i = 0; i < count; i++) {
      await deleteButtons.first().click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
    }
  } catch {
    // Cart clear is best-effort — don't fail the test if it errors
  }
}
