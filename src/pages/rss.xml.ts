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
  const siteOrigin = site ? site.toString().replace(/\/?$/, '') : 'https://mayurdb-blogs.in';
  const baseUrl = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const homeUrl = new URL(baseUrl, siteOrigin).toString();
  const feedUrl = new URL(`${baseUrl}rss.xml`, siteOrigin).toString();

  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime()
  );

  const itemsXml = posts
    .map((post) => {
      const postUrl = new URL(`${baseUrl}blog/${post.id}/`, siteOrigin).toString();
      const categories = (post.data.tags || [])
        .map((tag: string) => `      <category>${escapeXml(tag)}</category>`)
        .join('\n');

      return `    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${escapeXml(postUrl)}</link>
      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>
      <pubDate>${post.data.publishDate.toUTCString()}</pubDate>
      <author>${escapeXml(post.data.author || 'Mayur Bakale')}</author>
      <description>${escapeXml(post.data.description || post.data.title)}</description>
${categories}
    </item>`;
    })
    .join('\n');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>System Design &amp; Enterprise Architecture | Mayur Bakale</title>
    <link>${escapeXml(homeUrl)}</link>
    <description>Architecture blueprints, production code, and engineering patterns for full stack, cloud-native, and AI systems by Mayur Bakale.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};

