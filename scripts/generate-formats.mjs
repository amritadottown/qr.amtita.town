import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const membersPath = resolve(root, 'src', 'members.json');
const dist = resolve(root, 'dist');

const raw = readFileSync(membersPath, 'utf-8');
const members = JSON.parse(raw);

function shortcode(website) {
  return website.toLowerCase().split('/')[0].split('.')[0];
}

const slugs = new Set();
for (const m of members) {
  const name = m.name.toLowerCase().trim();
  slugs.add(name.replace(/\s+/g, '-'));
  for (const w of name.split(/\s+/)) slugs.add(w);
  slugs.add(shortcode(m.website));
}

// Also generate bare format variants for the root (amrita.town)
slugs.add('');

mkdirSync(dist, { recursive: true });

const FORMATS = [
  { ext: 'utf8', type: 'ansiutf8' },
  { ext: 'ascii', type: 'ascii' },
  { ext: 'png', type: 'png' },
];

let count = 0;
for (const slug of slugs) {
  // Determine which member(s) this slug matches
  const q = slug.toLowerCase().trim().replace(/-/g, ' ');
  const words = q.split(/\s+/).filter(Boolean);

  let matched;
  if (words.length === 0) {
    matched = members.filter(m => m.website === 'amrita.town');
  } else {
    const fullName = words.join(' ');
    matched = members.filter(m => m.name.toLowerCase() === fullName);
    if (matched.length === 0 && words.length === 1) {
      const single = words[0];
      matched = members.filter(m => {
        const parts = m.name.toLowerCase().split(/\s+/);
        return parts.some(p => p === single);
      });
      if (matched.length === 0) {
        matched = members.filter(m => shortcode(m.website) === single);
      }
    }
  }

  if (matched.length === 0) continue;

  for (const fmt of FORMATS) {
    const parts = [];
    for (const m of (matched.length > 1 && fmt.ext !== 'png' ? matched : [matched[0]])) {
      const targetUrl = `https://${m.website}/`;

      if (fmt.type === 'png') {
        const buf = execSync('qrencode -t png -o -', { input: targetUrl });
        const filename = slug ? `${slug}.${fmt.ext}` : `.${fmt.ext}`;
        writeFileSync(resolve(dist, filename), buf);
        count++;
        break; // only one PNG for the first match
      }

      const buf = execSync(`qrencode -t ${fmt.type}`, { input: targetUrl });
      const header = matched.length > 1 ? `# ${m.name}\n# ${targetUrl}\n` : '';
      parts.push(header + buf.toString());
    }

    if (fmt.type !== 'png') {
      const filename = slug ? `${slug}.${fmt.ext}` : `.${fmt.ext}`;
      writeFileSync(resolve(dist, filename), parts.join('\n\n'));
      count++;
    }
  }
}

console.log(`generated ${count} format files in ${dist}`);
