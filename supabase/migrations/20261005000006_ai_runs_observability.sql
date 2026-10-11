-- MIGRATION: AI Runs Observability & Telemetry

ALTER TABLE ai_runs
  ADD COLUMN status text NOT NULL DEFAULT 'success',
  ADD COLUMN error_message text,
  ADD COLUMN provider text,
  ADD COLUMN model text,
  ADD COLUMN prompt_tokens integer,
  ADD COLUMN completion_tokens integer,
  ADD COLUMN total_tokens integer,
  ADD COLUMN duration_ms integer;

CREATE INDEX idx_ai_runs_org_created ON ai_runs(organization_id, created_at DESC);
CREATE INDEX idx_ai_runs_org_status  ON ai_runs(organization_id, status);
