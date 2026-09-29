
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "asset_categories": {
                  Row: {
                    "created_at": string | null,"deleted_at": string | null,"description": string | null,"icon": string | null,"id": string,"is_system": boolean | null,"name": string,"organization_id": string,"parent_id": string | null,"slug": string,"sort_order": number | null,"updated_at": string | null
                  }
                  Insert: {
                    "created_at"?: string | null,"deleted_at"?: string | null,"description"?: string | null,"icon"?: string | null,"id"?: string,"is_system"?: boolean | null,"name": string,"organization_id": string,"parent_id"?: string | null,"slug": string,"sort_order"?: number | null,"updated_at"?: string | null
                  }
                  Update: {
                    "created_at"?: string | null,"deleted_at"?: string | null,"description"?: string | null,"icon"?: string | null,"id"?: string,"is_system"?: boolean | null,"name"?: string,"organization_id"?: string,"parent_id"?: string | null,"slug"?: string,"sort_order"?: number | null,"updated_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "asset_categories_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "asset_categories_parent_id_fkey"
      columns: ["parent_id"]
isOneToOne: false
      referencedRelation: "asset_categories"
      referencedColumns: ["id"]
    }
                  ]
                },"assets": {
                  Row: {
                    "alt_text": string | null,"asset_type": Database["public"]['Enums']["asset_type"],"brand_id": string | null,"category_id": string | null,"created_at": string | null,"created_by": string | null,"deleted_at": string | null,"description": string | null,"duration_seconds": number | null,"file_size": number | null,"height": number | null,"id": string,"is_public": boolean | null,"is_system": boolean | null,"metadata": Json | null,"mime_type": string | null,"name": string,"organization_id": string,"storage_bucket": string,"storage_path": string,"tags": (string)[] | null,"updated_at": string | null,"updated_by": string | null,"width": number | null
                  }
                  Insert: {
                    "alt_text"?: string | null,"asset_type": Database["public"]['Enums']["asset_type"],"brand_id"?: string | null,"category_id"?: string | null,"created_at"?: string | null,"created_by"?: string | null,"deleted_at"?: string | null,"description"?: string | null,"duration_seconds"?: number | null,"file_size"?: number | null,"height"?: number | null,"id"?: string,"is_public"?: boolean | null,"is_system"?: boolean | null,"metadata"?: Json | null,"mime_type"?: string | null,"name": string,"organization_id": string,"storage_bucket": string,"storage_path": string,"tags"?: (string)[] | null,"updated_at"?: string | null,"updated_by"?: string | null,"width"?: number | null
                  }
                  Update: {
                    "alt_text"?: string | null,"asset_type"?: Database["public"]['Enums']["asset_type"],"brand_id"?: string | null,"category_id"?: string | null,"created_at"?: string | null,"created_by"?: string | null,"deleted_at"?: string | null,"description"?: string | null,"duration_seconds"?: number | null,"file_size"?: number | null,"height"?: number | null,"id"?: string,"is_public"?: boolean | null,"is_system"?: boolean | null,"metadata"?: Json | null,"mime_type"?: string | null,"name"?: string,"organization_id"?: string,"storage_bucket"?: string,"storage_path"?: string,"tags"?: (string)[] | null,"updated_at"?: string | null,"updated_by"?: string | null,"width"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "assets_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "assets_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "asset_categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "assets_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"audit_logs": {
                  Row: {
                    "action": Database["public"]['Enums']["audit_action"],"created_at": string | null,"id": string,"ip_address": unknown,"new_data": Json | null,"old_data": Json | null,"organization_id": string | null,"record_id": string | null,"table_name": string,"user_agent": string | null,"user_id": string | null
                  }
                  Insert: {
                    "action": Database["public"]['Enums']["audit_action"],"created_at"?: string | null,"id"?: string,"ip_address"?: unknown,"new_data"?: Json | null,"old_data"?: Json | null,"organization_id"?: string | null,"record_id"?: string | null,"table_name": string,"user_agent"?: string | null,"user_id"?: string | null
                  }
                  Update: {
                    "action"?: Database["public"]['Enums']["audit_action"],"created_at"?: string | null,"id"?: string,"ip_address"?: unknown,"new_data"?: Json | null,"old_data"?: Json | null,"organization_id"?: string | null,"record_id"?: string | null,"table_name"?: string,"user_agent"?: string | null,"user_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "audit_logs_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"brand_colors": {
                  Row: {
                    "brand_id": string,"created_at": string | null,"hex_code": string,"id": string,"name": string,"role": string,"sort_order": number | null
                  }
                  Insert: {
                    "brand_id": string,"created_at"?: string | null,"hex_code": string,"id"?: string,"name": string,"role": string,"sort_order"?: number | null
                  }
                  Update: {
                    "brand_id"?: string,"created_at"?: string | null,"hex_code"?: string,"id"?: string,"name"?: string,"role"?: string,"sort_order"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "brand_colors_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    }
                  ]
                },"brand_fonts": {
                  Row: {
                    "brand_id": string,"created_at": string | null,"font_asset_id": string | null,"font_family": string,"id": string,"is_active": boolean | null,"name": string,"role": string,"weights": (string)[] | null
                  }
                  Insert: {
                    "brand_id": string,"created_at"?: string | null,"font_asset_id"?: string | null,"font_family": string,"id"?: string,"is_active"?: boolean | null,"name": string,"role": string,"weights"?: (string)[] | null
                  }
                  Update: {
                    "brand_id"?: string,"created_at"?: string | null,"font_asset_id"?: string | null,"font_family"?: string,"id"?: string,"is_active"?: boolean | null,"name"?: string,"role"?: string,"weights"?: (string)[] | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "brand_fonts_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    }
                  ]
                },"brands": {
                  Row: {
                    "created_at": string | null,"created_by": string | null,"deleted_at": string | null,"description": string | null,"forbidden_words": (string)[] | null,"id": string,"is_active": boolean | null,"is_default": boolean | null,"metadata": Json | null,"name": string,"organization_id": string,"preferred_cta": string | null,"slug": string,"tagline": string | null,"tone_of_voice": (string)[] | null,"updated_at": string | null,"updated_by": string | null
                  }
                  Insert: {
                    "created_at"?: string | null,"created_by"?: string | null,"deleted_at"?: string | null,"description"?: string | null,"forbidden_words"?: (string)[] | null,"id"?: string,"is_active"?: boolean | null,"is_default"?: boolean | null,"metadata"?: Json | null,"name": string,"organization_id": string,"preferred_cta"?: string | null,"slug": string,"tagline"?: string | null,"tone_of_voice"?: (string)[] | null,"updated_at"?: string | null,"updated_by"?: string | null
                  }
                  Update: {
                    "created_at"?: string | null,"created_by"?: string | null,"deleted_at"?: string | null,"description"?: string | null,"forbidden_words"?: (string)[] | null,"id"?: string,"is_active"?: boolean | null,"is_default"?: boolean | null,"metadata"?: Json | null,"name"?: string,"organization_id"?: string,"preferred_cta"?: string | null,"slug"?: string,"tagline"?: string | null,"tone_of_voice"?: (string)[] | null,"updated_at"?: string | null,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "brands_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"campaign_contents": {
                  Row: {
                    "added_at": string | null,"added_by": string | null,"campaign_id": string,"content_id": string
                  }
                  Insert: {
                    "added_at"?: string | null,"added_by"?: string | null,"campaign_id": string,"content_id": string
                  }
                  Update: {
                    "added_at"?: string | null,"added_by"?: string | null,"campaign_id"?: string,"content_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "campaign_contents_campaign_id_fkey"
      columns: ["campaign_id"]
isOneToOne: false
      referencedRelation: "campaigns"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "campaign_contents_content_id_fkey"
      columns: ["content_id"]
isOneToOne: false
      referencedRelation: "contents"
      referencedColumns: ["id"]
    }
                  ]
                },"campaign_designs": {
                  Row: {
                    "added_at": string | null,"added_by": string | null,"campaign_id": string,"design_id": string,"role": string | null
                  }
                  Insert: {
                    "added_at"?: string | null,"added_by"?: string | null,"campaign_id": string,"design_id": string,"role"?: string | null
                  }
                  Update: {
                    "added_at"?: string | null,"added_by"?: string | null,"campaign_id"?: string,"design_id"?: string,"role"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "campaign_designs_campaign_id_fkey"
      columns: ["campaign_id"]
isOneToOne: false
      referencedRelation: "campaigns"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "campaign_designs_design_id_fkey"
      columns: ["design_id"]
isOneToOne: false
      referencedRelation: "designs"
      referencedColumns: ["id"]
    }
                  ]
                },"campaigns": {
                  Row: {
                    "brand_id": string | null,"budget": number | null,"code": string,"cover_asset_id": string | null,"created_at": string | null,"created_by": string | null,"currency_code": string | null,"deleted_at": string | null,"description": string | null,"end_date": string | null,"id": string,"metadata": Json | null,"name": string,"objective": Database["public"]['Enums']["campaign_objective"] | null,"organization_id": string,"owner_id": string | null,"spent": number | null,"start_date": string | null,"status": Database["public"]['Enums']["campaign_status"] | null,"target_audience": string | null,"updated_at": string | null,"updated_by": string | null
                  }
                  Insert: {
                    "brand_id"?: string | null,"budget"?: number | null,"code": string,"cover_asset_id"?: string | null,"created_at"?: string | null,"created_by"?: string | null,"currency_code"?: string | null,"deleted_at"?: string | null,"description"?: string | null,"end_date"?: string | null,"id"?: string,"metadata"?: Json | null,"name": string,"objective"?: Database["public"]['Enums']["campaign_objective"] | null,"organization_id": string,"owner_id"?: string | null,"spent"?: number | null,"start_date"?: string | null,"status"?: Database["public"]['Enums']["campaign_status"] | null,"target_audience"?: string | null,"updated_at"?: string | null,"updated_by"?: string | null
                  }
                  Update: {
                    "brand_id"?: string | null,"budget"?: number | null,"code"?: string,"cover_asset_id"?: string | null,"created_at"?: string | null,"created_by"?: string | null,"currency_code"?: string | null,"deleted_at"?: string | null,"description"?: string | null,"end_date"?: string | null,"id"?: string,"metadata"?: Json | null,"name"?: string,"objective"?: Database["public"]['Enums']["campaign_objective"] | null,"organization_id"?: string,"owner_id"?: string | null,"spent"?: number | null,"start_date"?: string | null,"status"?: Database["public"]['Enums']["campaign_status"] | null,"target_audience"?: string | null,"updated_at"?: string | null,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "campaigns_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "campaigns_cover_asset_id_fkey"
      columns: ["cover_asset_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "campaigns_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"content_calendar": {
                  Row: {
                    "campaign_id": string | null,"color": string | null,"content_id": string | null,"created_at": string | null,"created_by": string | null,"design_id": string | null,"id": string,"notes": string | null,"organization_id": string,"platform": Database["public"]['Enums']["content_platform"] | null,"scheduled_at": string,"status": Database["public"]['Enums']["calendar_status"] | null,"updated_at": string | null,"updated_by": string | null
                  }
                  Insert: {
                    "campaign_id"?: string | null,"color"?: string | null,"content_id"?: string | null,"created_at"?: string | null,"created_by"?: string | null,"design_id"?: string | null,"id"?: string,"notes"?: string | null,"organization_id": string,"platform"?: Database["public"]['Enums']["content_platform"] | null,"scheduled_at": string,"status"?: Database["public"]['Enums']["calendar_status"] | null,"updated_at"?: string | null,"updated_by"?: string | null
                  }
                  Update: {
                    "campaign_id"?: string | null,"color"?: string | null,"content_id"?: string | null,"created_at"?: string | null,"created_by"?: string | null,"design_id"?: string | null,"id"?: string,"notes"?: string | null,"organization_id"?: string,"platform"?: Database["public"]['Enums']["content_platform"] | null,"scheduled_at"?: string,"status"?: Database["public"]['Enums']["calendar_status"] | null,"updated_at"?: string | null,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "content_calendar_campaign_id_fkey"
      columns: ["campaign_id"]
isOneToOne: false
      referencedRelation: "campaigns"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "content_calendar_content_id_fkey"
      columns: ["content_id"]
isOneToOne: false
      referencedRelation: "contents"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "content_calendar_design_id_fkey"
      columns: ["design_id"]
isOneToOne: false
      referencedRelation: "designs"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "content_calendar_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"content_categories": {
                  Row: {
                    "color": string | null,"created_at": string | null,"deleted_at": string | null,"description": string | null,"id": string,"is_system": boolean | null,"name": string,"organization_id": string,"parent_id": string | null,"slug": string,"sort_order": number | null,"updated_at": string | null
                  }
                  Insert: {
                    "color"?: string | null,"created_at"?: string | null,"deleted_at"?: string | null,"description"?: string | null,"id"?: string,"is_system"?: boolean | null,"name": string,"organization_id": string,"parent_id"?: string | null,"slug": string,"sort_order"?: number | null,"updated_at"?: string | null
                  }
                  Update: {
                    "color"?: string | null,"created_at"?: string | null,"deleted_at"?: string | null,"description"?: string | null,"id"?: string,"is_system"?: boolean | null,"name"?: string,"organization_id"?: string,"parent_id"?: string | null,"slug"?: string,"sort_order"?: number | null,"updated_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "content_categories_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "content_categories_parent_id_fkey"
      columns: ["parent_id"]
isOneToOne: false
      referencedRelation: "content_categories"
      referencedColumns: ["id"]
    }
                  ]
                },"content_versions": {
                  Row: {
                    "body": string | null,"change_note": string | null,"content_id": string,"created_at": string | null,"created_by": string | null,"id": string,"metadata": Json | null,"title": string | null,"version": number
                  }
                  Insert: {
                    "body"?: string | null,"change_note"?: string | null,"content_id": string,"created_at"?: string | null,"created_by"?: string | null,"id"?: string,"metadata"?: Json | null,"title"?: string | null,"version": number
                  }
                  Update: {
                    "body"?: string | null,"change_note"?: string | null,"content_id"?: string,"created_at"?: string | null,"created_by"?: string | null,"id"?: string,"metadata"?: Json | null,"title"?: string | null,"version"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "content_versions_content_id_fkey"
      columns: ["content_id"]
isOneToOne: false
      referencedRelation: "contents"
      referencedColumns: ["id"]
    }
                  ]
                },"contents": {
                  Row: {
                    "approved_at": string | null,"approver_id": string | null,"body": string | null,"brand_id": string | null,"category_id": string | null,"content_type": Database["public"]['Enums']["content_type"] | null,"created_at": string | null,"created_by": string | null,"cta": string | null,"current_version": number | null,"deleted_at": string | null,"excerpt": string | null,"hashtags": (string)[] | null,"id": string,"metadata": Json | null,"organization_id": string,"owner_id": string | null,"platform": Database["public"]['Enums']["content_platform"] | null,"published_at": string | null,"scheduled_at": string | null,"slug": string | null,"status": Database["public"]['Enums']["content_status"] | null,"thumbnail_asset_id": string | null,"title": string,"tone": string | null,"updated_at": string | null,"updated_by": string | null
                  }
                  Insert: {
                    "approved_at"?: string | null,"approver_id"?: string | null,"body"?: string | null,"brand_id"?: string | null,"category_id"?: string | null,"content_type"?: Database["public"]['Enums']["content_type"] | null,"created_at"?: string | null,"created_by"?: string | null,"cta"?: string | null,"current_version"?: number | null,"deleted_at"?: string | null,"excerpt"?: string | null,"hashtags"?: (string)[] | null,"id"?: string,"metadata"?: Json | null,"organization_id": string,"owner_id"?: string | null,"platform"?: Database["public"]['Enums']["content_platform"] | null,"published_at"?: string | null,"scheduled_at"?: string | null,"slug"?: string | null,"status"?: Database["public"]['Enums']["content_status"] | null,"thumbnail_asset_id"?: string | null,"title": string,"tone"?: string | null,"updated_at"?: string | null,"updated_by"?: string | null
                  }
                  Update: {
                    "approved_at"?: string | null,"approver_id"?: string | null,"body"?: string | null,"brand_id"?: string | null,"category_id"?: string | null,"content_type"?: Database["public"]['Enums']["content_type"] | null,"created_at"?: string | null,"created_by"?: string | null,"cta"?: string | null,"current_version"?: number | null,"deleted_at"?: string | null,"excerpt"?: string | null,"hashtags"?: (string)[] | null,"id"?: string,"metadata"?: Json | null,"organization_id"?: string,"owner_id"?: string | null,"platform"?: Database["public"]['Enums']["content_platform"] | null,"published_at"?: string | null,"scheduled_at"?: string | null,"slug"?: string | null,"status"?: Database["public"]['Enums']["content_status"] | null,"thumbnail_asset_id"?: string | null,"title"?: string,"tone"?: string | null,"updated_at"?: string | null,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "contents_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "contents_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "content_categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "contents_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "contents_thumbnail_asset_id_fkey"
      columns: ["thumbnail_asset_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id"]
    }
                  ]
                },"design_elements": {
                  Row: {
                    "asset_id": string | null,"content": string | null,"created_at": string | null,"created_by": string | null,"design_id": string,"element_type": Database["public"]['Enums']["design_element_type"],"height": number,"id": string,"locked": boolean | null,"metadata": Json | null,"opacity": number | null,"parent_id": string | null,"role": string | null,"rotation": number | null,"source_template_element_id": string | null,"style": Json | null,"updated_at": string | null,"updated_by": string | null,"visible": boolean | null,"width": number,"x": number,"y": number,"z_index": number | null
                  }
                  Insert: {
                    "asset_id"?: string | null,"content"?: string | null,"created_at"?: string | null,"created_by"?: string | null,"design_id": string,"element_type": Database["public"]['Enums']["design_element_type"],"height": number,"id"?: string,"locked"?: boolean | null,"metadata"?: Json | null,"opacity"?: number | null,"parent_id"?: string | null,"role"?: string | null,"rotation"?: number | null,"source_template_element_id"?: string | null,"style"?: Json | null,"updated_at"?: string | null,"updated_by"?: string | null,"visible"?: boolean | null,"width": number,"x": number,"y": number,"z_index"?: number | null
                  }
                  Update: {
                    "asset_id"?: string | null,"content"?: string | null,"created_at"?: string | null,"created_by"?: string | null,"design_id"?: string,"element_type"?: Database["public"]['Enums']["design_element_type"],"height"?: number,"id"?: string,"locked"?: boolean | null,"metadata"?: Json | null,"opacity"?: number | null,"parent_id"?: string | null,"role"?: string | null,"rotation"?: number | null,"source_template_element_id"?: string | null,"style"?: Json | null,"updated_at"?: string | null,"updated_by"?: string | null,"visible"?: boolean | null,"width"?: number,"x"?: number,"y"?: number,"z_index"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "design_elements_asset_id_fkey"
      columns: ["asset_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "design_elements_design_id_fkey"
      columns: ["design_id"]
isOneToOne: false
      referencedRelation: "designs"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "design_elements_parent_id_fkey"
      columns: ["parent_id"]
isOneToOne: false
      referencedRelation: "design_elements"
      referencedColumns: ["id"]
    }
                  ]
                },"design_versions": {
                  Row: {
                    "change_note": string | null,"created_at": string | null,"created_by": string | null,"design_id": string,"id": string,"snapshot": NonNullable<Json>,"version": number
                  }
                  Insert: {
                    "change_note"?: string | null,"created_at"?: string | null,"created_by"?: string | null,"design_id": string,"id"?: string,"snapshot": NonNullable<Json>,"version": number
                  }
                  Update: {
                    "change_note"?: string | null,"created_at"?: string | null,"created_by"?: string | null,"design_id"?: string,"id"?: string,"snapshot"?: NonNullable<Json>,"version"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "design_versions_design_id_fkey"
      columns: ["design_id"]
isOneToOne: false
      referencedRelation: "designs"
      referencedColumns: ["id"]
    }
                  ]
                },"designs": {
                  Row: {
                    "brand_id": string | null,"created_at": string | null,"created_by": string,"current_version": number | null,"deleted_at": string | null,"design_type": Database["public"]['Enums']["template_type"],"format_code": string,"height": number,"id": string,"name": string,"organization_id": string,"preview_asset_id": string | null,"source_template_id": string | null,"source_template_version": number | null,"status": Database["public"]['Enums']["design_status"] | null,"unit": string | null,"updated_at": string | null,"updated_by": string | null,"width": number
                  }
                  Insert: {
                    "brand_id"?: string | null,"created_at"?: string | null,"created_by": string,"current_version"?: number | null,"deleted_at"?: string | null,"design_type": Database["public"]['Enums']["template_type"],"format_code": string,"height": number,"id"?: string,"name": string,"organization_id": string,"preview_asset_id"?: string | null,"source_template_id"?: string | null,"source_template_version"?: number | null,"status"?: Database["public"]['Enums']["design_status"] | null,"unit"?: string | null,"updated_at"?: string | null,"updated_by"?: string | null,"width": number
                  }
                  Update: {
                    "brand_id"?: string | null,"created_at"?: string | null,"created_by"?: string,"current_version"?: number | null,"deleted_at"?: string | null,"design_type"?: Database["public"]['Enums']["template_type"],"format_code"?: string,"height"?: number,"id"?: string,"name"?: string,"organization_id"?: string,"preview_asset_id"?: string | null,"source_template_id"?: string | null,"source_template_version"?: number | null,"status"?: Database["public"]['Enums']["design_status"] | null,"unit"?: string | null,"updated_at"?: string | null,"updated_by"?: string | null,"width"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "designs_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "designs_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "designs_preview_asset_id_fkey"
      columns: ["preview_asset_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "designs_source_template_id_fkey"
      columns: ["source_template_id"]
isOneToOne: false
      referencedRelation: "templates"
      referencedColumns: ["id"]
    }
                  ]
                },"document_template_versions": {
                  Row: {
                    "change_note": string | null,"created_at": string | null,"created_by": string | null,"document_template_id": string,"id": string,"styles": Json | null,"template_content": string,"variables": NonNullable<Json>,"version": number
                  }
                  Insert: {
                    "change_note"?: string | null,"created_at"?: string | null,"created_by"?: string | null,"document_template_id": string,"id"?: string,"styles"?: Json | null,"template_content": string,"variables": NonNullable<Json>,"version": number
                  }
                  Update: {
                    "change_note"?: string | null,"created_at"?: string | null,"created_by"?: string | null,"document_template_id"?: string,"id"?: string,"styles"?: Json | null,"template_content"?: string,"variables"?: NonNullable<Json>,"version"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "document_template_versions_document_template_id_fkey"
      columns: ["document_template_id"]
isOneToOne: false
      referencedRelation: "document_templates"
      referencedColumns: ["id"]
    }
                  ]
                },"document_templates": {
                  Row: {
                    "brand_id": string | null,"code": string,"cover_asset_id": string | null,"created_at": string | null,"created_by": string | null,"current_version": number | null,"deleted_at": string | null,"description": string | null,"document_type": Database["public"]['Enums']["document_type"],"footer_asset_id": string | null,"header_asset_id": string | null,"id": string,"is_active": boolean | null,"is_system": boolean | null,"name": string,"organization_id": string,"page_orientation": string | null,"page_size": string | null,"styles": Json | null,"template_content": string,"updated_at": string | null,"updated_by": string | null,"variables": NonNullable<Json>
                  }
                  Insert: {
                    "brand_id"?: string | null,"code": string,"cover_asset_id"?: string | null,"created_at"?: string | null,"created_by"?: string | null,"current_version"?: number | null,"deleted_at"?: string | null,"description"?: string | null,"document_type": Database["public"]['Enums']["document_type"],"footer_asset_id"?: string | null,"header_asset_id"?: string | null,"id"?: string,"is_active"?: boolean | null,"is_system"?: boolean | null,"name": string,"organization_id": string,"page_orientation"?: string | null,"page_size"?: string | null,"styles"?: Json | null,"template_content": string,"updated_at"?: string | null,"updated_by"?: string | null,"variables"?: NonNullable<Json>
                  }
                  Update: {
                    "brand_id"?: string | null,"code"?: string,"cover_asset_id"?: string | null,"created_at"?: string | null,"created_by"?: string | null,"current_version"?: number | null,"deleted_at"?: string | null,"description"?: string | null,"document_type"?: Database["public"]['Enums']["document_type"],"footer_asset_id"?: string | null,"header_asset_id"?: string | null,"id"?: string,"is_active"?: boolean | null,"is_system"?: boolean | null,"name"?: string,"organization_id"?: string,"page_orientation"?: string | null,"page_size"?: string | null,"styles"?: Json | null,"template_content"?: string,"updated_at"?: string | null,"updated_by"?: string | null,"variables"?: NonNullable<Json>
                  }
                  Relationships: [
                    {
      foreignKeyName: "document_templates_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "document_templates_cover_asset_id_fkey"
      columns: ["cover_asset_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "document_templates_footer_asset_id_fkey"
      columns: ["footer_asset_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "document_templates_header_asset_id_fkey"
      columns: ["header_asset_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "document_templates_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"document_versions": {
                  Row: {
                    "change_note": string | null,"created_at": string | null,"created_by": string | null,"document_id": string,"docx_asset_id": string | null,"id": string,"pdf_asset_id": string | null,"rendered_content": string | null,"variables_data": Json | null,"version": number
                  }
                  Insert: {
                    "change_note"?: string | null,"created_at"?: string | null,"created_by"?: string | null,"document_id": string,"docx_asset_id"?: string | null,"id"?: string,"pdf_asset_id"?: string | null,"rendered_content"?: string | null,"variables_data"?: Json | null,"version": number
                  }
                  Update: {
                    "change_note"?: string | null,"created_at"?: string | null,"created_by"?: string | null,"document_id"?: string,"docx_asset_id"?: string | null,"id"?: string,"pdf_asset_id"?: string | null,"rendered_content"?: string | null,"variables_data"?: Json | null,"version"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "document_versions_document_id_fkey"
      columns: ["document_id"]
isOneToOne: false
      referencedRelation: "documents"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "document_versions_docx_asset_id_fkey"
      columns: ["docx_asset_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "document_versions_pdf_asset_id_fkey"
      columns: ["pdf_asset_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id"]
    }
                  ]
                },"documents": {
                  Row: {
                    "approved_at": string | null,"approver_id": string | null,"brand_id": string | null,"campaign_id": string | null,"company_id": string | null,"contact_id": string | null,"created_at": string | null,"created_by": string | null,"currency_code": string | null,"current_version": number | null,"deleted_at": string | null,"document_number": string,"document_type": Database["public"]['Enums']["document_type"],"docx_asset_id": string | null,"id": string,"issued_date": string | null,"lead_id": string | null,"metadata": Json | null,"notes": string | null,"opportunity_id": string | null,"organization_id": string,"owner_id": string | null,"pdf_asset_id": string | null,"preview_asset_id": string | null,"rendered_content": string | null,"sent_at": string | null,"signed_at": string | null,"status": Database["public"]['Enums']["document_status"] | null,"template_id": string | null,"title": string,"total_amount": number | null,"updated_at": string | null,"updated_by": string | null,"valid_until": string | null,"variables_data": Json | null
                  }
                  Insert: {
                    "approved_at"?: string | null,"approver_id"?: string | null,"brand_id"?: string | null,"campaign_id"?: string | null,"company_id"?: string | null,"contact_id"?: string | null,"created_at"?: string | null,"created_by"?: string | null,"currency_code"?: string | null,"current_version"?: number | null,"deleted_at"?: string | null,"document_number": string,"document_type": Database["public"]['Enums']["document_type"],"docx_asset_id"?: string | null,"id"?: string,"issued_date"?: string | null,"lead_id"?: string | null,"metadata"?: Json | null,"notes"?: string | null,"opportunity_id"?: string | null,"organization_id": string,"owner_id"?: string | null,"pdf_asset_id"?: string | null,"preview_asset_id"?: string | null,"rendered_content"?: string | null,"sent_at"?: string | null,"signed_at"?: string | null,"status"?: Database["public"]['Enums']["document_status"] | null,"template_id"?: string | null,"title": string,"total_amount"?: number | null,"updated_at"?: string | null,"updated_by"?: string | null,"valid_until"?: string | null,"variables_data"?: Json | null
                  }
                  Update: {
                    "approved_at"?: string | null,"approver_id"?: string | null,"brand_id"?: string | null,"campaign_id"?: string | null,"company_id"?: string | null,"contact_id"?: string | null,"created_at"?: string | null,"created_by"?: string | null,"currency_code"?: string | null,"current_version"?: number | null,"deleted_at"?: string | null,"document_number"?: string,"document_type"?: Database["public"]['Enums']["document_type"],"docx_asset_id"?: string | null,"id"?: string,"issued_date"?: string | null,"lead_id"?: string | null,"metadata"?: Json | null,"notes"?: string | null,"opportunity_id"?: string | null,"organization_id"?: string,"owner_id"?: string | null,"pdf_asset_id"?: string | null,"preview_asset_id"?: string | null,"rendered_content"?: string | null,"sent_at"?: string | null,"signed_at"?: string | null,"status"?: Database["public"]['Enums']["document_status"] | null,"template_id"?: string | null,"title"?: string,"total_amount"?: number | null,"updated_at"?: string | null,"updated_by"?: string | null,"valid_until"?: string | null,"variables_data"?: Json | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "documents_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "documents_campaign_id_fkey"
      columns: ["campaign_id"]
isOneToOne: false
      referencedRelation: "campaigns"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "documents_docx_asset_id_fkey"
      columns: ["docx_asset_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "documents_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "documents_pdf_asset_id_fkey"
      columns: ["pdf_asset_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "documents_preview_asset_id_fkey"
      columns: ["preview_asset_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "documents_template_id_fkey"
      columns: ["template_id"]
isOneToOne: false
      referencedRelation: "document_templates"
      referencedColumns: ["id"]
    }
                  ]
                },"notifications": {
                  Row: {
                    "action_url": string | null,"body": string | null,"created_at": string | null,"entity_id": string | null,"entity_type": string | null,"id": string,"is_read": boolean | null,"metadata": Json | null,"organization_id": string,"read_at": string | null,"title": string,"type": Database["public"]['Enums']["notification_type"] | null,"user_id": string
                  }
                  Insert: {
                    "action_url"?: string | null,"body"?: string | null,"created_at"?: string | null,"entity_id"?: string | null,"entity_type"?: string | null,"id"?: string,"is_read"?: boolean | null,"metadata"?: Json | null,"organization_id": string,"read_at"?: string | null,"title": string,"type"?: Database["public"]['Enums']["notification_type"] | null,"user_id": string
                  }
                  Update: {
                    "action_url"?: string | null,"body"?: string | null,"created_at"?: string | null,"entity_id"?: string | null,"entity_type"?: string | null,"id"?: string,"is_read"?: boolean | null,"metadata"?: Json | null,"organization_id"?: string,"read_at"?: string | null,"title"?: string,"type"?: Database["public"]['Enums']["notification_type"] | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notifications_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"organization_members": {
                  Row: {
                    "created_at": string | null,"id": string,"invited_at": string | null,"invited_by": string | null,"joined_at": string | null,"organization_id": string,"role_id": string,"status": Database["public"]['Enums']["membership_status"] | null,"updated_at": string | null,"user_id": string
                  }
                  Insert: {
                    "created_at"?: string | null,"id"?: string,"invited_at"?: string | null,"invited_by"?: string | null,"joined_at"?: string | null,"organization_id": string,"role_id": string,"status"?: Database["public"]['Enums']["membership_status"] | null,"updated_at"?: string | null,"user_id": string
                  }
                  Update: {
                    "created_at"?: string | null,"id"?: string,"invited_at"?: string | null,"invited_by"?: string | null,"joined_at"?: string | null,"organization_id"?: string,"role_id"?: string,"status"?: Database["public"]['Enums']["membership_status"] | null,"updated_at"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "organization_members_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "organization_members_role_id_fkey"
      columns: ["role_id"]
isOneToOne: false
      referencedRelation: "roles"
      referencedColumns: ["id"]
    }
                  ]
                },"organizations": {
                  Row: {
                    "address": string | null,"city": string | null,"country_code": string | null,"created_at": string | null,"created_by": string | null,"currency_code": string | null,"deleted_at": string | null,"email": string | null,"id": string,"industry": string | null,"is_active": boolean | null,"legal_name": string | null,"locale": string | null,"metadata": Json | null,"name": string,"phone": string | null,"postal_code": string | null,"province": string | null,"slug": string,"subscription_plan": string | null,"timezone": string | null,"updated_at": string | null,"updated_by": string | null,"website": string | null
                  }
                  Insert: {
                    "address"?: string | null,"city"?: string | null,"country_code"?: string | null,"created_at"?: string | null,"created_by"?: string | null,"currency_code"?: string | null,"deleted_at"?: string | null,"email"?: string | null,"id"?: string,"industry"?: string | null,"is_active"?: boolean | null,"legal_name"?: string | null,"locale"?: string | null,"metadata"?: Json | null,"name": string,"phone"?: string | null,"postal_code"?: string | null,"province"?: string | null,"slug": string,"subscription_plan"?: string | null,"timezone"?: string | null,"updated_at"?: string | null,"updated_by"?: string | null,"website"?: string | null
                  }
                  Update: {
                    "address"?: string | null,"city"?: string | null,"country_code"?: string | null,"created_at"?: string | null,"created_by"?: string | null,"currency_code"?: string | null,"deleted_at"?: string | null,"email"?: string | null,"id"?: string,"industry"?: string | null,"is_active"?: boolean | null,"legal_name"?: string | null,"locale"?: string | null,"metadata"?: Json | null,"name"?: string,"phone"?: string | null,"postal_code"?: string | null,"province"?: string | null,"slug"?: string,"subscription_plan"?: string | null,"timezone"?: string | null,"updated_at"?: string | null,"updated_by"?: string | null,"website"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"permissions": {
                  Row: {
                    "code": string,"created_at": string | null,"description": string | null,"id": string,"module": string,"name": string
                  }
                  Insert: {
                    "code": string,"created_at"?: string | null,"description"?: string | null,"id"?: string,"module": string,"name": string
                  }
                  Update: {
                    "code"?: string,"created_at"?: string | null,"description"?: string | null,"id"?: string,"module"?: string,"name"?: string
                  }
                  Relationships: [
                    
                  ]
                },"profiles": {
                  Row: {
                    "avatar_asset_id": string | null,"bio": string | null,"created_at": string | null,"default_organization_id": string | null,"email": string | null,"full_name": string | null,"id": string,"is_active": boolean | null,"job_title": string | null,"last_seen_at": string | null,"locale": string | null,"metadata": Json | null,"phone": string | null,"timezone": string | null,"updated_at": string | null
                  }
                  Insert: {
                    "avatar_asset_id"?: string | null,"bio"?: string | null,"created_at"?: string | null,"default_organization_id"?: string | null,"email"?: string | null,"full_name"?: string | null,"id": string,"is_active"?: boolean | null,"job_title"?: string | null,"last_seen_at"?: string | null,"locale"?: string | null,"metadata"?: Json | null,"phone"?: string | null,"timezone"?: string | null,"updated_at"?: string | null
                  }
                  Update: {
                    "avatar_asset_id"?: string | null,"bio"?: string | null,"created_at"?: string | null,"default_organization_id"?: string | null,"email"?: string | null,"full_name"?: string | null,"id"?: string,"is_active"?: boolean | null,"job_title"?: string | null,"last_seen_at"?: string | null,"locale"?: string | null,"metadata"?: Json | null,"phone"?: string | null,"timezone"?: string | null,"updated_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "profiles_default_organization_id_fkey"
      columns: ["default_organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"role_permissions": {
                  Row: {
                    "created_at": string | null,"permission_id": string,"role_id": string
                  }
                  Insert: {
                    "created_at"?: string | null,"permission_id": string,"role_id": string
                  }
                  Update: {
                    "created_at"?: string | null,"permission_id"?: string,"role_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "role_permissions_permission_id_fkey"
      columns: ["permission_id"]
isOneToOne: false
      referencedRelation: "permissions"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "role_permissions_role_id_fkey"
      columns: ["role_id"]
isOneToOne: false
      referencedRelation: "roles"
      referencedColumns: ["id"]
    }
                  ]
                },"roles": {
                  Row: {
                    "created_at": string | null,"description": string | null,"display_name": string,"id": string,"is_system": boolean | null,"name": string,"organization_id": string,"updated_at": string | null
                  }
                  Insert: {
                    "created_at"?: string | null,"description"?: string | null,"display_name": string,"id"?: string,"is_system"?: boolean | null,"name": string,"organization_id": string,"updated_at"?: string | null
                  }
                  Update: {
                    "created_at"?: string | null,"description"?: string | null,"display_name"?: string,"id"?: string,"is_system"?: boolean | null,"name"?: string,"organization_id"?: string,"updated_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "roles_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"settings": {
                  Row: {
                    "category": string,"created_at": string | null,"id": string,"key": string,"organization_id": string,"updated_at": string | null,"value": Json | null
                  }
                  Insert: {
                    "category": string,"created_at"?: string | null,"id"?: string,"key": string,"organization_id": string,"updated_at"?: string | null,"value"?: Json | null
                  }
                  Update: {
                    "category"?: string,"created_at"?: string | null,"id"?: string,"key"?: string,"organization_id"?: string,"updated_at"?: string | null,"value"?: Json | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "settings_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"template_categories": {
                  Row: {
                    "created_at": string | null,"deleted_at": string | null,"description": string | null,"icon": string | null,"id": string,"is_system": boolean | null,"name": string,"organization_id": string,"parent_id": string | null,"slug": string,"sort_order": number | null,"template_type": Database["public"]['Enums']["template_type"] | null,"updated_at": string | null
                  }
                  Insert: {
                    "created_at"?: string | null,"deleted_at"?: string | null,"description"?: string | null,"icon"?: string | null,"id"?: string,"is_system"?: boolean | null,"name": string,"organization_id": string,"parent_id"?: string | null,"slug": string,"sort_order"?: number | null,"template_type"?: Database["public"]['Enums']["template_type"] | null,"updated_at"?: string | null
                  }
                  Update: {
                    "created_at"?: string | null,"deleted_at"?: string | null,"description"?: string | null,"icon"?: string | null,"id"?: string,"is_system"?: boolean | null,"name"?: string,"organization_id"?: string,"parent_id"?: string | null,"slug"?: string,"sort_order"?: number | null,"template_type"?: Database["public"]['Enums']["template_type"] | null,"updated_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "template_categories_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "template_categories_parent_id_fkey"
      columns: ["parent_id"]
isOneToOne: false
      referencedRelation: "template_categories"
      referencedColumns: ["id"]
    }
                  ]
                },"template_elements": {
                  Row: {
                    "asset_id": string | null,"content": string | null,"created_at": string | null,"element_type": Database["public"]['Enums']["design_element_type"],"height": number,"id": string,"locked": boolean | null,"metadata": Json | null,"opacity": number | null,"parent_id": string | null,"role": string | null,"rotation": number | null,"style": Json | null,"template_id": string,"updated_at": string | null,"variable_id": string | null,"visible": boolean | null,"width": number,"x": number,"y": number,"z_index": number | null
                  }
                  Insert: {
                    "asset_id"?: string | null,"content"?: string | null,"created_at"?: string | null,"element_type": Database["public"]['Enums']["design_element_type"],"height": number,"id"?: string,"locked"?: boolean | null,"metadata"?: Json | null,"opacity"?: number | null,"parent_id"?: string | null,"role"?: string | null,"rotation"?: number | null,"style"?: Json | null,"template_id": string,"updated_at"?: string | null,"variable_id"?: string | null,"visible"?: boolean | null,"width": number,"x": number,"y": number,"z_index"?: number | null
                  }
                  Update: {
                    "asset_id"?: string | null,"content"?: string | null,"created_at"?: string | null,"element_type"?: Database["public"]['Enums']["design_element_type"],"height"?: number,"id"?: string,"locked"?: boolean | null,"metadata"?: Json | null,"opacity"?: number | null,"parent_id"?: string | null,"role"?: string | null,"rotation"?: number | null,"style"?: Json | null,"template_id"?: string,"updated_at"?: string | null,"variable_id"?: string | null,"visible"?: boolean | null,"width"?: number,"x"?: number,"y"?: number,"z_index"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "template_elements_asset_id_fkey"
      columns: ["asset_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "template_elements_parent_id_fkey"
      columns: ["parent_id"]
isOneToOne: false
      referencedRelation: "template_elements"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "template_elements_template_id_fkey"
      columns: ["template_id"]
isOneToOne: false
      referencedRelation: "templates"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "template_elements_variable_id_fkey"
      columns: ["variable_id"]
isOneToOne: false
      referencedRelation: "template_variables"
      referencedColumns: ["id"]
    }
                  ]
                },"template_variables": {
                  Row: {
                    "created_at": string | null,"default_value": string | null,"id": string,"is_required": boolean | null,"label": string,"max_length": number | null,"placeholder": string | null,"sort_order": number | null,"template_id": string,"updated_at": string | null,"validation_rules": Json | null,"variable_key": string,"variable_type": Database["public"]['Enums']["template_variable_type"]
                  }
                  Insert: {
                    "created_at"?: string | null,"default_value"?: string | null,"id"?: string,"is_required"?: boolean | null,"label": string,"max_length"?: number | null,"placeholder"?: string | null,"sort_order"?: number | null,"template_id": string,"updated_at"?: string | null,"validation_rules"?: Json | null,"variable_key": string,"variable_type": Database["public"]['Enums']["template_variable_type"]
                  }
                  Update: {
                    "created_at"?: string | null,"default_value"?: string | null,"id"?: string,"is_required"?: boolean | null,"label"?: string,"max_length"?: number | null,"placeholder"?: string | null,"sort_order"?: number | null,"template_id"?: string,"updated_at"?: string | null,"validation_rules"?: Json | null,"variable_key"?: string,"variable_type"?: Database["public"]['Enums']["template_variable_type"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "template_variables_template_id_fkey"
      columns: ["template_id"]
isOneToOne: false
      referencedRelation: "templates"
      referencedColumns: ["id"]
    }
                  ]
                },"template_versions": {
                  Row: {
                    "change_note": string | null,"created_at": string | null,"created_by": string | null,"id": string,"schema_snapshot": NonNullable<Json>,"template_id": string,"version": number
                  }
                  Insert: {
                    "change_note"?: string | null,"created_at"?: string | null,"created_by"?: string | null,"id"?: string,"schema_snapshot": NonNullable<Json>,"template_id": string,"version": number
                  }
                  Update: {
                    "change_note"?: string | null,"created_at"?: string | null,"created_by"?: string | null,"id"?: string,"schema_snapshot"?: NonNullable<Json>,"template_id"?: string,"version"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "template_versions_template_id_fkey"
      columns: ["template_id"]
isOneToOne: false
      referencedRelation: "templates"
      referencedColumns: ["id"]
    }
                  ]
                },"templates": {
                  Row: {
                    "background_asset_id": string | null,"brand_id": string | null,"category_id": string | null,"code": string,"created_at": string | null,"created_by": string | null,"current_version": number | null,"deleted_at": string | null,"description": string | null,"format_code": string,"height": number,"id": string,"is_active": boolean | null,"is_system": boolean | null,"metadata": Json | null,"name": string,"organization_id": string,"template_type": Database["public"]['Enums']["template_type"],"thumbnail_asset_id": string | null,"unit": string | null,"updated_at": string | null,"updated_by": string | null,"usage_count": number | null,"width": number
                  }
                  Insert: {
                    "background_asset_id"?: string | null,"brand_id"?: string | null,"category_id"?: string | null,"code": string,"created_at"?: string | null,"created_by"?: string | null,"current_version"?: number | null,"deleted_at"?: string | null,"description"?: string | null,"format_code": string,"height": number,"id"?: string,"is_active"?: boolean | null,"is_system"?: boolean | null,"metadata"?: Json | null,"name": string,"organization_id": string,"template_type": Database["public"]['Enums']["template_type"],"thumbnail_asset_id"?: string | null,"unit"?: string | null,"updated_at"?: string | null,"updated_by"?: string | null,"usage_count"?: number | null,"width": number
                  }
                  Update: {
                    "background_asset_id"?: string | null,"brand_id"?: string | null,"category_id"?: string | null,"code"?: string,"created_at"?: string | null,"created_by"?: string | null,"current_version"?: number | null,"deleted_at"?: string | null,"description"?: string | null,"format_code"?: string,"height"?: number,"id"?: string,"is_active"?: boolean | null,"is_system"?: boolean | null,"metadata"?: Json | null,"name"?: string,"organization_id"?: string,"template_type"?: Database["public"]['Enums']["template_type"],"thumbnail_asset_id"?: string | null,"unit"?: string | null,"updated_at"?: string | null,"updated_by"?: string | null,"usage_count"?: number | null,"width"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "templates_background_asset_id_fkey"
      columns: ["background_asset_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "templates_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "templates_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "template_categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "templates_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "templates_thumbnail_asset_id_fkey"
      columns: ["thumbnail_asset_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            [_ in never]: never
          }
          Enums: {
            "asset_type": "image"|"font"|"video"|"document"|"audio"|"archive"|"other","audit_action": "create"|"update"|"delete"|"login"|"logout"|"export","calendar_status": "planned"|"scheduled"|"published"|"failed"|"cancelled","campaign_objective": "awareness"|"consideration"|"conversion"|"loyalty"|"other","campaign_status": "draft"|"active"|"paused"|"completed"|"cancelled","content_platform": "instagram"|"facebook"|"linkedin"|"whatsapp"|"website"|"other","content_status": "draft"|"review"|"approved"|"published"|"archived","content_type": "post"|"story"|"reel"|"article"|"announcement","design_element_type": "text"|"image"|"logo"|"icon"|"shape"|"line"|"button"|"badge"|"qr"|"group","design_status": "draft"|"review"|"approved"|"archived","document_status": "draft"|"review"|"approved"|"sent"|"signed"|"void","document_type": "proposal"|"mou"|"quotation"|"invoice"|"receipt"|"contract"|"other","membership_status": "active"|"invited"|"suspended"|"left","notification_type": "info"|"success"|"warning"|"error"|"mention","template_type": "flyer"|"poster"|"banner"|"social_post"|"social_story"|"custom","template_variable_type": "text"|"long_text"|"number"|"date"|"image"|"color"|"url"|"email"|"phone"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "asset_type": ["image", "font", "video", "document", "audio", "archive", "other"],"audit_action": ["create", "update", "delete", "login", "logout", "export"],"calendar_status": ["planned", "scheduled", "published", "failed", "cancelled"],"campaign_objective": ["awareness", "consideration", "conversion", "loyalty", "other"],"campaign_status": ["draft", "active", "paused", "completed", "cancelled"],"content_platform": ["instagram", "facebook", "linkedin", "whatsapp", "website", "other"],"content_status": ["draft", "review", "approved", "published", "archived"],"content_type": ["post", "story", "reel", "article", "announcement"],"design_element_type": ["text", "image", "logo", "icon", "shape", "line", "button", "badge", "qr", "group"],"design_status": ["draft", "review", "approved", "archived"],"document_status": ["draft", "review", "approved", "sent", "signed", "void"],"document_type": ["proposal", "mou", "quotation", "invoice", "receipt", "contract", "other"],"membership_status": ["active", "invited", "suspended", "left"],"notification_type": ["info", "success", "warning", "error", "mention"],"template_type": ["flyer", "poster", "banner", "social_post", "social_story", "custom"],"template_variable_type": ["text", "long_text", "number", "date", "image", "color", "url", "email", "phone"]
          }
        }
} as const

