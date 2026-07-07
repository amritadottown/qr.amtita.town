import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const dest = resolve(root, 'src', 'members.json');
const url = 'https://raw.githubusercontent.com/amritadottown/website/refs/heads/main/src/members.json';

const res = await fetch(url);
if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
const json = await res.text();
writeFileSync(dest, json);
console.log(`wrote ${dest} (${json.length} bytes)`);
