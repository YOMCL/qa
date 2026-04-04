import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

test('debug login codelpa', async ({ page }) => {
  const email = process.env.CODELPA_STAGING_EMAIL || '';
  const password = process.env.CODELPA_STAGING_PASSWORD || '';
  
  console.log('Email:', email);
  console.log('URL: https://beta-codelpa.solopide.me/auth/jwt/login');

  await page.goto('https://beta-codelpa.solopide.me/auth/jwt/login');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/1-loaded.png' });

  // Ver todos los inputs en la página
  const inputs = await page.locator('input').all();
  console.log('Inputs encontrados:', inputs.length);
  for (const input of inputs) {
    const type = await input.getAttribute('type');
    const name = await input.getAttribute('name');
    const placeholder = await input.getAttribute('placeholder');
    console.log(`  input: type=${type} name=${name} placeholder=${placeholder}`);
  }

  // Ver todos los botones
  const buttons = await page.locator('button').all();
  console.log('Botones encontrados:', buttons.length);
  for (const btn of buttons) {
    const text = await btn.textContent();
    const type = await btn.getAttribute('type');
    console.log(`  button: type=${type} text="${text?.trim()}"`);
  }

  // Llenar formulario
  const emailInput = page.locator('input[type="email"]').or(page.locator('input[name="email"]')).first();
  await emailInput.fill(email);
  
  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.fill(password);
  
  await page.screenshot({ path: '/tmp/2-filled.png' });

  // Intentar submit con Enter en vez de click
  await passwordInput.press('Enter');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/3-after-enter.png' });
  
  console.log('URL después de Enter:', page.url());
});
