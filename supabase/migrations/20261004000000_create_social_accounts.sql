-- MIGRATION: Phase 07/08 Auto Post (Social Media)
CREATE TABLE social_accounts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    platform content_platform NOT NULL,
    account_id text NOT NULL,
    account_name text,
    access_token text NOT NULL,
    refresh_token text,
    expires_at timestamptz,
    status text DEFAULT 'active',
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    
    -- Ensure an organization can only connect one account per platform for now
    -- Or you might want multiple, but typically there's a unique constraint on (organization_id, platform, account_id)
    UNIQUE(organization_id, platform, account_id)
);

CREATE INDEX idx_social_accounts_org ON social_accounts(organization_id);

ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view social_accounts in their organization"
    ON social_accounts FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert social_accounts in their organization"
    ON social_accounts FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update social_accounts in their organization"
    ON social_accounts FOR UPDATE
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete social_accounts in their organization"
    ON social_accounts FOR DELETE
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

ALTER TABLE content_calendar ADD COLUMN IF NOT EXISTS is_auto_post boolean DEFAULT false;
