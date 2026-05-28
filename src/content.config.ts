import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const caseStudies = defineCollection({
  loader: glob({
    pattern: '*/index.{md,mdx}',
    base: './src/content/case-studies',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      tagline: z.string(),
      company: z.string(),
      role: z.string(),
      dates: z.string(),
      domain: z.string().optional(),
      tech: z.array(z.string()).optional(),
      heroImage: image(),
      heroImageAlt: z.string(),
      heroImageSecondary: image().optional(),
      heroImageSecondaryAlt: z.string().optional(),
      cardImage: image().optional(),
      cardImageAlt: z.string().optional(),
      gallery: z
        .array(
          z.object({
            src: image(),
            alt: z.string(),
            caption: z.string().optional(),
          }),
        )
        .optional(),
      tags: z.array(z.string()).optional(),
      featured: z.boolean().default(false),
      order: z.number().optional(),
      isCurrent: z.boolean().default(false),
    }),
});

export const collections = { 'case-studies': caseStudies };
