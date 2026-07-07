import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = () => {
  const body = `\
qr.amrita.town
━━━━━━━━━━━━━━

Generate QR codes for amrita.town members.

Usage
    curl qr.amrita.town/<name>[.<format>]
    curl "qr.amrita.town/<name>?f=<format>"

Formats
    .utf8      terminal ANSI art (default)
    .ascii     plain block characters
    .png       image

Name matching
    adithya-nair     exact full name (hyphenated)
    nair             matches any member with "nair" in name
    heftymouse       website shortcode (first part of domain)

Multiple matches return all QR codes separated by headers.
For PNG, only the first match is returned.

Examples
    curl qr.amrita.town/adithya-nair.utf8
    curl qr.amrita.town/nair.ascii
    curl qr.amrita.town/heftymouse.png
    curl qr.amrita.town/adithya?f=ascii
    curl qr.amrita.town/                      # amrita.town itself

Part of the amrita.town webring — https://amrita.town
`;

  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
