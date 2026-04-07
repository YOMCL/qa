import { test as base, expect } from '@playwright/test';
import { loginHelper } from './login';

interface ClientConfig {
  name: string;
  baseURL: string;
  loginPath: string;
  credentials: { email: string; password: string };
  config: Record<string, any>;
  [key: string]: any;
}

/**
 * Factory: creates a test instance with authedPage for a specific client.
 * Usage in specs:
 *
 *   for (const [key, client] of Object.entries(clients)) {
 *     const test = createClientTest(client);
 *     test.describe(...) { ... }
 *   }
 */
export function createClientTest(client: ClientConfig) {
  return base.extend<{ authedPage: typeof base['prototype']['page'] }>({
    authedPage: async ({ browser }, use) => {
      const context = await browser.newContext({ baseURL: client.baseURL });
      const page = await context.newPage();
      await loginHelper(page, client.credentials.email, client.credentials.password, client.loginPath, client.baseURL);
      await use(page);
      await context.close();
    },
  });
}

export { expect };
