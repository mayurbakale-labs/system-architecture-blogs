import { z, defineCollection } from 'astro:content';
// 1. Import the new glob loader
import { glob } from 'astro/loaders'; 

const blogCollection = defineCollection({
  // 2. Remove the old `type: 'content'` and replace it with the loader
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    updatedDate: z.date().optional(),
    complexity: z.enum(['Intermediate', 'Advanced', 'Expert']),
    tags: z.array(z.string()),
    author: z.string().default('Mayur Bakale'),
    target_audience: z.string().optional(),
  }),
});

export const collections = {
  'blog': blogCollection,
};