import { execSync } from 'child_process';
import { readFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';

const PID_FILE = join(__dirname, '../../.http-server.pid');

export default async function globalTeardown() {
  // Matar servidor local
  if (existsSync(PID_FILE)) {
    try {
      const pid = parseInt(readFileSync(PID_FILE, 'utf8').trim());
      process.kill(pid);
    } catch {}
    try { unlinkSync(PID_FILE); } catch {}
  }

  // Limpiar live.json
  try { unlinkSync(join(__dirname, '../../public/live.json')); } catch {}

  // Publicar resultados al dashboard
  const root = join(__dirname, '../..');
  try {
    execSync('python3 tools/publish-results.py', { cwd: root, stdio: 'inherit' });
  } catch (e) {
    console.error('⚠️  publish-results.py falló:', e);
  }

  // Git commit + push (skip en CI — lo hace el workflow)
  if (process.env.CI) return;
  try {
    const date = new Date().toISOString().split('T')[0];
    execSync(
      `git diff --quiet public/ && git diff --cached --quiet public/ || ` +
      `(git add public/ && git commit -m "chore: publish playwright results ${date}" && ` +
      `(git push || (git pull --rebase && git push)))`,
      { cwd: root, shell: '/bin/bash', stdio: 'inherit' }
    );
  } catch (e) {
    console.error('⚠️  git push falló:', e);
  }
}
