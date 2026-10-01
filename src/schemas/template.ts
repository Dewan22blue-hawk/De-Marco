import { z } from "zod";

export const templateVariableSchema = z.object({
  id: z.string().uuid().optional(),
  variable_key: z.string().min(1, "Variable key is required"),
  label: z.string().min(1, "Label is required"),
  variable_type: z.enum(["text", "long_text", "number", "date", "image", "color", "url", "email", "phone"]),
  default_value: z.string().optional().nullable(),
  placeholder: z.string().optional().nullable(),
  is_required: z.boolean().default(false),
  max_length: z.number().int().optional(),
  sort_order: z.number().int().default(0),
  validation_rules: z.record(z.string(), z.any()).default(() => ({})),
});

export const templateElementSchema = z.object({
  id: z.string().uuid().optional(),
  parent_id: z.string().uuid().optional().nullable(),
  element_type: z.enum(["text", "image", "logo", "icon", "shape", "line", "button", "badge", "qr", "group"]),
  role: z.string().optional().nullable(),
  variable_id: z.string().uuid().optional().nullable(),
  asset_id: z.string().uuid().optional().nullable(),
  x: z.number(),
  y: z.number(),
  width: z.number().nonnegative(),
  height: z.number().nonnegative(),
  rotation: z.number().default(0),
  opacity: z.number().min(0).max(1).default(1),
  z_index: z.number().int().default(0),
  visible: z.boolean().default(true),
  locked: z.boolean().default(false),
  content: z.string().optional().nullable(),
  style: z.record(z.string(), z.any()).default(() => ({})),
  metadata: z.record(z.string(), z.any()).default(() => ({})),
});

export const templateSchema = z.object({
  id: z.string().uuid().optional(),
  organization_id: z.string().uuid(),
  category_id: z.string().uuid().optional().nullable(),
  brand_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1, "Template name is required"),
  code: z.string().min(1, "Code is required").regex(/^[a-z0-9-_]+$/, "Code must be lowercase alphanumeric with hyphens/underscores"),
  description: z.string().optional().nullable(),
  template_type: z.enum(["flyer", "poster", "banner", "social_post", "social_story", "custom"]),
  format_code: z.string().min(1, "Format code is required"),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  unit: z.string().default("px"),
  thumbnail_asset_id: z.string().uuid().optional().nullable(),
  background_asset_id: z.string().uuid().optional().nullable(),
  is_system: z.boolean().default(false),
  is_active: z.boolean().default(true),
  variables: z.array(templateVariableSchema).optional(),
  elements: z.array(templateElementSchema).optional(),
});

export const templateCategorySchema = z.object({
  id: z.string().uuid().optional(),
  organization_id: z.string().uuid(),
  parent_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1),
  slug: z.string().min(1),
  template_type: z.enum(["flyer", "poster", "banner", "social_post", "social_story", "custom"]).optional(),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  sort_order: z.number().int().default(0),
  is_system: z.boolean().default(false),
});

export type Template = z.infer<typeof templateSchema>;
export type TemplateVariable = z.infer<typeof templateVariableSchema>;
export type TemplateElement = z.infer<typeof templateElementSchema>;
export type TemplateCategory = z.infer<typeof templateCategorySchema>;

// Variable replacement helper types
export interface VariableValues {
  [key: string]: string | number | boolean | null;
}

export interface TemplateWithRelations extends Template {
  template_variables: TemplateVariable[];
  template_elements: TemplateElement[];
  category?: TemplateCategory;
  brand?: { id: string; name: string };
  thumbnail?: { storage_path: string; storage_bucket: string };
  background?: { storage_path: string; storage_bucket: string };
  current_version?: number;
  usage_count?: number;
}