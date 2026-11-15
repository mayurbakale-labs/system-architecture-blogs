import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const siteOrigin = site ? site.toString().replace(/\/?$/, '') : 'https://mayurbakale-labs.github.io';
  const baseUrl = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const sitemapUrl = new URL(`${baseUrl}sitemap.xml`, siteOrigin).toString();

  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${sitemapUrl}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};

