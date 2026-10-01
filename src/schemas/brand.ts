import { z } from "zod";

export const brandColorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Color name is required"),
  hex_code: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex code"),
  role: z.string().min(1, "Role is required"),
  sort_order: z.number().int().default(0),
});

export const brandFontSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Font name is required"),
  role: z.string().min(1, "Role is required"),
  font_family: z.string().min(1, "Font family is required"),
  font_asset_id: z.string().optional().nullable(),
  weights: z.array(z.string()).optional(),
  is_active: z.boolean().default(true),
});

export const brandKitSchema = z.object({
  id: z.string().optional(),
  organization_id: z.string(),
  name: z.string().min(1, "Brand name is required"),
  slug: z.string().min(1, "Slug is required"),
  tagline: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  tone_of_voice: z.array(z.string()).optional(),
  forbidden_words: z.array(z.string()).optional(),
  preferred_cta: z.string().optional().nullable(),
  is_default: z.boolean().default(false),
  logo_asset_id: z.string().optional().nullable(),
  colors: z.array(brandColorSchema).optional(),
  fonts: z.array(brandFontSchema).optional(),
});

export type BrandKit = z.infer<typeof brandKitSchema>;
export type BrandColor = z.infer<typeof brandColorSchema>;
export type BrandFont = z.infer<typeof brandFontSchema>;
