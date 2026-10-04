-- MIGRATION: Phase 06 AI Layer & Audit (Governance)

CREATE TABLE ai_runs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    task_type text NOT NULL,
    input_context jsonb DEFAULT '{}',
    output jsonb,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

CREATE INDEX idx_ai_runs_org ON ai_runs(organization_id);

ALTER TABLE ai_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ai_runs in their organization"
    ON ai_runs FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert ai_runs in their organization"
    ON ai_runs FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    );
