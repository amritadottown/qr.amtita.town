import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = () => {
  const body = `\
qr.nithitsuki.com
━━━━━━━━━━━━━━━

Generate QR codes for amrita.town members.

Usage
    curl qr.nithitsuki.com/<name>[.<format>]
    curl "qr.nithitsuki.com/<name>?f=<format>"

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
    curl qr.nithitsuki.com/adithya-nair.utf8
    curl qr.nithitsuki.com/nair.ascii
    curl qr.nithitsuki.com/heftymouse.png
    curl qr.nithitsuki.com/adithya?f=ascii
    curl qr.nithitsuki.com/                      # amrita.town itself

Part of the amrita.town webring — https://amrita.town
`;

  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
