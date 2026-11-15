import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const siteOrigin = site ? site.toString().replace(/\/?$/, '') : 'https://mayurbakale-labs.github.io';
  const baseUrl = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const homeUrl = new URL(baseUrl, siteOrigin).toString();

  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime()
  );

  const latestPostDate = posts.length > 0
    ? (posts[0].data.updatedDate || posts[0].data.publishDate).toISOString()
    : new Date().toISOString();

  const urls = [
    {
      loc: homeUrl,
      lastmod: latestPostDate,
      changefreq: 'weekly',
      priority: '1.0',
    },
    ...posts.map((post) => ({
      loc: new URL(`${baseUrl}blog/${post.id}/`, siteOrigin).toString(),
      lastmod: (post.data.updatedDate || post.data.publishDate).toISOString(),
      changefreq: 'monthly',
      priority: '0.8',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};

