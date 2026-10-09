-- MIGRATION: AI Settings Vault
CREATE TABLE IF NOT EXISTS public.ai_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    provider text NOT NULL DEFAULT 'gemini',
    api_key_encrypted text, -- Store as encrypted/masked string
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(organization_id, provider)
);

ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage AI settings" ON public.ai_settings
    FOR ALL TO authenticated
    USING (private.has_permission(organization_id, 'organizations.update'))
    WITH CHECK (private.has_permission(organization_id, 'organizations.update'));
