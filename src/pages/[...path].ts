import type { APIRoute } from 'astro';
import { findMembers } from '../lib/members';
import { generateQR, parseFormat, isValidFormat, type QRFormat } from '../lib/qr';

export const prerender = false;

function wantsHtml(accept: string | null): boolean {
  return accept !== null && accept.includes('text/html');
}

function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, '');
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderHtml(body: string, title: string, desc: string, img: string): string {
  return `<!DOCTYPE html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<title>${esc(title)}</title>
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(img)}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary">
<link rel="icon" href="/favicon.png">
<style>
body { margin: 0; background: #000; }
pre { color: #fff; background: #000; padding: 1em; }
</style>
<pre>${body}</pre>`;
}

function render(
  data: Buffer,
  contentType: string,
  extraHeaders: Record<string, string>,
  accept: string | null,
  htmlMeta?: { title: string; desc: string; img: string },
): Response {
  if (contentType.startsWith('text/') && wantsHtml(accept) && htmlMeta) {
    const clean = stripAnsi(data.toString());
    return new Response(renderHtml(clean, htmlMeta.title, htmlMeta.desc, htmlMeta.img), {
      status: 200,
      headers: { ...extraHeaders, 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
  return new Response(data, {
    status: 200,
    headers: { ...extraHeaders, 'Content-Type': contentType },
  });
}

export const GET: APIRoute = ({ params, request }) => {
  const rawPath = params.path as string | undefined;
  const url = new URL(request.url);
  const queryFormat = url.searchParams.get('f');
  const accept = request.headers.get('Accept');
  const origin = url.origin;

  let name: string;
  let fmt: QRFormat;

  if (rawPath) {
    const lastDot = rawPath.lastIndexOf('.');
    if (lastDot !== -1) {
      const ext = rawPath.slice(lastDot + 1).toLowerCase();
      if (isValidFormat(ext)) {
        name = rawPath.slice(0, lastDot);
        fmt = ext;
      } else {
        name = rawPath;
        fmt = parseFormat(queryFormat);
      }
    } else {
      name = rawPath;
      fmt = parseFormat(queryFormat);
    }
  } else {
    name = '';
    fmt = parseFormat(queryFormat);
  }

  const members = findMembers(name);

  if (members.length === 0) {
    return new Response('Not found\n', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const ogName = name || 'amrita.town';
  const ogImage = `${origin}/${ogName}.png`;

  if (members.length === 1) {
    const m = members[0];
    const targetUrl = `https://${m.website}/`;
    const qr = generateQR(targetUrl, fmt);
    return render(qr.data, qr.contentType, {
      'X-QR-Target': targetUrl,
      'X-QR-Member': m.name,
    }, accept, {
      title: `qr.nithitsuki.com — ${m.name}`,
      desc: `QR code for ${m.name} on the amrita.town webring`,
      img: ogImage,
    });
  }

  if (fmt === 'png') {
    const m = members[0];
    const targetUrl = `https://${m.website}/`;
    const qr = generateQR(targetUrl, fmt);
    return render(qr.data, qr.contentType, {
      'X-QR-Target': targetUrl,
      'X-QR-Member': m.name,
      'X-QR-Multiple-Matches': members.map(x => x.name).join(', '),
    }, accept, {
      title: `qr.nithitsuki.com — ${members.length} matches`,
      desc: `QR codes for ${members.map(x => x.name).join(', ')}`,
      img: ogImage,
    });
  }

  const parts = members.map(m => {
    const targetUrl = `https://${m.website}/`;
    const qr = generateQR(targetUrl, fmt);
    return `# ${m.name}\n# ${targetUrl}\n${qr.data.toString()}`;
  });

  const body = Buffer.from(parts.join('\n\n'));
  return render(body, 'text/plain; charset=utf-8', {}, accept, {
    title: `qr.nithitsuki.com — ${members.length} matches`,
    desc: `QR codes for ${members.map(x => x.name).join(', ')}`,
    img: ogImage,
  });
};
