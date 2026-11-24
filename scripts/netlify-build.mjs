import { spawnSync } from 'node:child_process';

const rawUrl = process.env.VITE_CONVEX_URL;
let url;
try {
  url = new URL(rawUrl);
} catch {
  throw new Error('Set VITE_CONVEX_URL to the intended Convex deployment URL before building.');
}
if (url.protocol !== 'https:' || !url.hostname.endsWith('.convex.cloud')) {
  throw new Error('VITE_CONVEX_URL must be an HTTPS Convex cloud URL.');
}
if (process.env.CONTEXT === 'production' && url.hostname !== 'benevolent-mosquito-853.eu-west-1.convex.cloud') {
  throw new Error('Production builds must use the migrated itemtracker deployment. Check netlify.toml.');
}
if (process.env.VITE_BASE_PATH && process.env.VITE_BASE_PATH !== '/') {
  throw new Error('Netlify builds must use the root base path /.');
}
const result = spawnSync('npm', ['run', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, VITE_BASE_PATH: '/' },
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
