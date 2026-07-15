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
    // Alt text for the hero image (accessibility + SEO). Empty string = decorative.
    heroAlt: z.string().optional(),
    // Shorter <title> tag for SERPs when the H1 is long-form.
    seoTitle: z.string().optional(),
    // Visible attribution line, e.g. team-authored + medically reviewed.
    byline: z.string().optional(),
    // Name of the medical reviewer → emitted as schema.org reviewedBy (EEAT).
    reviewedBy: z.string().optional(),
    // When true, schema author is the Organization rather than a Person.
    authorOrg: z.boolean().default(false),
    draft: z.boolean().default(false),
    // Optional FAQ block rendered at the end of the post + emitted as FAQPage JSON-LD.
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  }),
});

export const collections = { blog };
