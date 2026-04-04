import { test } from '@playwright/test';
import clients from '../fixtures/clients';

test('debug credentials en clients.ts', async () => {
  for (const [key, client] of Object.entries(clients)) {
    console.log(`Client: ${key}`);
    console.log(`  email: "${client.credentials.email}"`);
    console.log(`  password: "${client.credentials.password ? '***' : 'VACÍO'}"`);
    console.log(`  baseURL: ${client.baseURL}`);
    console.log(`  loginPath: ${client.loginPath}`);
  }
});
