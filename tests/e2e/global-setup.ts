import { spawn, execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

const PID_FILE = join(__dirname, '../../.http-server.pid');

export default async function globalSetup() {
  // Skip en CI — no hay browser que abrir
  if (process.env.CI) return;

  const publicDir = join(__dirname, '../../public');

  const server = spawn('python3', ['-m', 'http.server', '8080', '--directory', publicDir], {
    detached: true,
    stdio: 'ignore',
  });
  server.unref();

  if (server.pid) {
    writeFileSync(PID_FILE, String(server.pid));
  }

  await new Promise(r => setTimeout(r, 600));

  try {
    execSync('open http://localhost:8080');
  } catch {}
}
