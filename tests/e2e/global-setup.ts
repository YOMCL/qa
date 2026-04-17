import { execSync } from 'child_process';

export default async function globalSetup() {
  // Skip en CI — no hay browser que abrir
  if (process.env.CI) return;

  // webServer config handles server lifecycle.
  // Just open the dashboard in browser (best-effort, macOS only).
  try {
    execSync('open http://localhost:8080');
  } catch {}
}
