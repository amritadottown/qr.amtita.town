import { execSync } from 'node:child_process';

export type QRFormat = 'utf8' | 'ascii' | 'png';

export function stripAnsi(s: string): string {
  return s.replace(/\x1b\[[0-9;]*m/g, '');
}

const VALID_FORMATS = new Set<string>(['utf8', 'ascii', 'png']);

export function isValidFormat(s: string): s is QRFormat {
  return VALID_FORMATS.has(s);
}

export function parseFormat(s: string | undefined): QRFormat {
  if (s && isValidFormat(s)) return s;
  return 'utf8';
}

export interface QRResult {
  data: Buffer;
  contentType: string;
}

export function generateQR(text: string, format: QRFormat): QRResult {
  switch (format) {
    case 'utf8': {
      const buf = execSync('qrencode -t ansiutf8', { input: text });
      return { data: buf, contentType: 'text/plain; charset=utf-8' };
    }
    case 'ascii': {
      const buf = execSync('qrencode -t ascii', { input: text });
      return { data: buf, contentType: 'text/plain; charset=utf-8' };
    }
    case 'png': {
      const buf = execSync('qrencode -t png -o -', { input: text });
      return { data: buf, contentType: 'image/png' };
    }
  }
}
