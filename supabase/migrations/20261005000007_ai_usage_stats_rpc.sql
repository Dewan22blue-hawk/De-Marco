-- MIGRATION: RPC for accurate and efficient AI usage aggregates

CREATE OR REPLACE FUNCTION public.get_ai_usage_stats(p_organization_id uuid)
RETURNS TABLE (
  total_runs bigint,
  total_errors bigint,
  total_prompt_tokens bigint,
  total_completion_tokens bigint,
  total_tokens bigint
)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$
  SELECT
    COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE status = 'error')::bigint,
    COALESCE(SUM(prompt_tokens),0)::bigint,
    COALESCE(SUM(completion_tokens),0)::bigint,
    COALESCE(SUM(total_tokens),0)::bigint
  FROM public.ai_runs
  WHERE organization_id = p_organization_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_ai_usage_stats(uuid) TO authenticated;
