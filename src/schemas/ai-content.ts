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
