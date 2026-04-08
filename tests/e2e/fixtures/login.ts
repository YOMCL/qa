import { expect, Page } from '@playwright/test';

/**
 * Login helper — navigates directly to loginPath and submits credentials.
 * Uses Enter key to submit (avoids ambiguity with header "Iniciar sesión" button).
 */
export async function loginHelper(
  page: Page,
  email: string,
  password: string,
  loginPath: string = '/auth/jwt/login',
  baseURL?: string
) {
  const url = baseURL ? `${baseURL}${loginPath}` : loginPath;

  // Navigate to login page and wait for network to settle
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

  // Wait for email input to appear (SPA needs time to render)
  // Direct name selectors avoid .or() chain resolution issues with MUI controlled inputs
  const emailInput = page.locator('input[name="email"]').first();
  const passwordInput = page.locator('input[name="password"]').first();

  await emailInput.waitFor({ state: 'visible', timeout: 45000 });

  // fill() properly triggers React's onChange via Playwright's internal event dispatch
  await emailInput.click();
  await emailInput.fill(email);
  await passwordInput.click();
  await passwordInput.fill(password);
  await passwordInput.press('Enter');

  // Wait for redirect away from login page
  await expect(page).not.toHaveURL(/auth\/jwt\/login|\/login$/, { timeout: 45_000 });
}
