import { z } from "zod";

export const GeneratedContentSchema = z.object({
  title: z.string().min(3).max(100),
  body: z.string().min(10),
  hashtags: z.array(z.string()).default([]),
  cta: z.string().optional().default(""),
  tone: z.string().optional().default("Professional"),
  content_type: z.enum(["post", "story", "reel", "article", "announcement"]).default("post"),
});

export type GeneratedContent = z.infer<typeof GeneratedContentSchema>;

export const DesignElementSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'image', 'logo', 'icon', 'shape', 'line', 'button', 'badge', 'qr', 'group']),
  content: z.string().optional(),
  asset_id: z.string().optional(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number().optional(),
  opacity: z.number().optional(),
  z_index: z.number().optional(),
  style: z.record(z.string(), z.any()).optional(),
});

export const DesignOutputSchema = z.object({
  name: z.string(),
  design_type: z.enum(['flyer', 'poster', 'banner', 'social_post', 'social_story', 'custom']).catch('custom'),
  width: z.union([z.number(), z.string().transform(Number)]),
  height: z.union([z.number(), z.string().transform(Number)]),
  unit: z.string().default('px'),
  elements: z.array(DesignElementSchema),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type DesignElement = z.infer<typeof DesignElementSchema>;
export type DesignOutput = z.infer<typeof DesignOutputSchema>;
