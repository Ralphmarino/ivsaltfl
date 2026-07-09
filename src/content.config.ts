import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string(),
    author: z.string().default('Sara A. Carroll, BSN, RN'),
    heroImage: z.string().optional(),
    draft: z.boolean().default(false),
    // Optional FAQ block rendered at the end of the post + emitted as FAQPage JSON-LD.
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  }),
});

export const collections = { blog };
