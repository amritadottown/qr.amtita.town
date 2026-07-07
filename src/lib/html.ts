function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function renderHtml(body: string, title: string, desc: string, img: string): string {
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
