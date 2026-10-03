import { z } from "zod";
import { designElementTypeSchema, designStatusSchema } from "./template"; // Assuming we can extract or create these

// Redefining enums if not easily importable
export const DesignStatus = z.enum(["draft", "review", "approved", "archived"]);
export const DesignElementType = z.enum(["shape", "text", "image", "group"]);

export const designSchema = z.object({
  id: z.string().uuid().optional(),
  organization_id: z.string().uuid(),
  source_template_id: z.string().uuid().optional().nullable(),
  source_template_version: z.number().int().optional().nullable(),
  brand_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1, "Name is required"),
  design_type: z.string().min(1, "Design type is required"),
  format_code: z.string().min(1, "Format code is required"),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  unit: z.string().default("px"),
  status: DesignStatus.default("draft"),
  preview_asset_id: z.string().uuid().optional().nullable(),
  created_by: z.string().uuid(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const designElementSchema = z.object({
  id: z.string().uuid().optional(),
  design_id: z.string().uuid(),
  parent_id: z.string().uuid().optional().nullable(),
  source_template_element_id: z.string().uuid().optional().nullable(),
  element_type: DesignElementType,
  asset_id: z.string().uuid().optional().nullable(),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number().default(0),
  opacity: z.number().min(0).max(1).default(1),
  z_index: z.number().int().default(0),
  visible: z.boolean().default(true),
  locked: z.boolean().default(false),
  content: z.record(z.unknown()).optional(),
  style: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const designVersionSchema = z.object({
  id: z.string().uuid().optional(),
  design_id: z.string().uuid(),
  version: z.number().int().positive(),
  snapshot: z.record(z.unknown()),
  created_by: z.string().uuid(),
});

export type Design = z.infer<typeof designSchema>;
export type DesignElement = z.infer<typeof designElementSchema>;
export type DesignVersion = z.infer<typeof designVersionSchema>;
