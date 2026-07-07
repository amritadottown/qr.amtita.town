import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..', '..');

export interface Member {
  name: string;
  website: string;
  branch: string;
  campus: string;
  batch: string;
  feeds?: string[];
}

const MEMBERS_PATH = resolve(PROJECT_ROOT, 'src', 'members.json');

let cachedMembers: Member[] | null = null;

export function loadMembers(): Member[] {
  if (cachedMembers) return cachedMembers;
  const raw = readFileSync(MEMBERS_PATH, 'utf-8');
  cachedMembers = JSON.parse(raw) as Member[];
  return cachedMembers;
}

export function findMembers(slug: string): Member[] {
  const all = loadMembers();
  const q = slug.toLowerCase().trim().replace(/-/g, ' ');
  const words = q.split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return all.filter(m => m.website === 'amrita.town');
  }

  const fullName = words.join(' ');

  const exact = all.filter(m => m.name.toLowerCase() === fullName);
  if (exact.length > 0) return exact;

  if (words.length === 1) {
    const single = words[0];
    const nameMatches = all.filter(m => {
      const parts = m.name.toLowerCase().split(/\s+/);
      return parts.some(p => p === single);
    });
    if (nameMatches.length > 0) return nameMatches;

    const shortcodeMatches = all.filter(m => {
      const domain = m.website.toLowerCase().split('/')[0];
      return domain.split('.')[0] === single;
    });
    if (shortcodeMatches.length > 0) return shortcodeMatches;
  }

  return [];
}
