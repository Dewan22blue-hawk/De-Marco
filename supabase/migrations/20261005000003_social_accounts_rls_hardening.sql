-- MIGRATION: Phase 07/08 Auto Post Security Hardening
-- Drop the existing policies
DROP POLICY IF EXISTS "Users can insert social_accounts in their organization" ON social_accounts;
DROP POLICY IF EXISTS "Users can update social_accounts in their organization" ON social_accounts;
DROP POLICY IF EXISTS "Users can delete social_accounts in their organization" ON social_accounts;

-- Create hardened policies that require organization management permissions
CREATE POLICY "Users can insert social_accounts in their organization"
    ON social_accounts FOR INSERT
    WITH CHECK (
        private.has_permission(organization_id, 'organizations.update')
    );

CREATE POLICY "Users can update social_accounts in their organization"
    ON social_accounts FOR UPDATE
    USING (
        private.has_permission(organization_id, 'organizations.update')
    )
    WITH CHECK (
        private.has_permission(organization_id, 'organizations.update')
    );

CREATE POLICY "Users can delete social_accounts in their organization"
    ON social_accounts FOR DELETE
    USING (
        private.has_permission(organization_id, 'organizations.update')
    );
