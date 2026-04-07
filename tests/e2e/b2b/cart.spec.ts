import { test, expect } from '@playwright/test';
import { loginHelper } from '../fixtures/login';
import clients from '../fixtures/clients';

for (const [key, client] of Object.entries(clients)) {
  test.describe(`C2 — Carrito de compras: ${client.name}`, () => {
    test.use({ baseURL: client.baseURL });

    test.beforeEach(async ({ page }) => {
      await loginHelper(page, client.credentials.email, client.credentials.password, client.loginPath, client.baseURL);
      await page.goto(`${client.baseURL}/products`);
      await expect(page.getByRole('button', { name: 'Agregar' }).first()).toBeVisible({ timeout: 30_000 });
    });

    test(`${key}: C2-05 Agregar producto al carro`, async ({ page }) => {
      const addButton = page.getByRole('button', { name: 'Agregar' }).first();

      const [response] = await Promise.all([
        page.waitForResponse(resp => resp.url().includes('/cart') && resp.request().method() === 'POST'),
        addButton.click(),
      ]);

      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body).toBeTruthy();
    });

    test(`${key}: C2-08 Modificar cantidad en carro`, async ({ page }) => {
      await Promise.all([
        page.waitForResponse(resp => resp.url().includes('/cart') && resp.request().method() === 'POST'),
        page.getByRole('button', { name: 'Agregar' }).first().click(),
      ]);

      await page.goto(`${client.baseURL}/cart`);
      await expect(page.getByText(/\d+ Producto/)).toBeVisible({ timeout: 15_000 });

      const quantityInput = page.locator('input[type="number"]').first();
      await expect(quantityInput).toBeVisible({ timeout: 10_000 });
      await quantityInput.fill('3');
      await quantityInput.press('Tab');

      await page.waitForResponse(resp => resp.url().includes('/cart'), { timeout: 10_000 });
      await expect(quantityInput).toHaveValue('3');
    });

    test(`${key}: C2-09 Eliminar producto del carro`, async ({ page }) => {
      await Promise.all([
        page.waitForResponse(resp => resp.url().includes('/cart') && resp.request().method() === 'POST'),
        page.getByRole('button', { name: 'Agregar' }).first().click(),
      ]);

      await page.goto(`${client.baseURL}/cart`);
      await expect(page.getByText(/\d+ Producto/)).toBeVisible({ timeout: 15_000 });

      const deleteAll = page.getByRole('button', { name: /eliminar todos/i });
      if (await deleteAll.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await deleteAll.click();
        await expect(page.getByText('0 Producto')).toBeVisible({ timeout: 10_000 });
      } else {
        const deleteButton = page.locator('[aria-label*="delete" i], [aria-label*="eliminar" i]').first();
        await deleteButton.click();
        await page.waitForResponse(resp => resp.url().includes('/cart'), { timeout: 10_000 });
      }
    });
  });
}
