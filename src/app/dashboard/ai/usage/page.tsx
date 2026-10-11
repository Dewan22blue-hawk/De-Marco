import { getCurrentUserContext } from "@/lib/auth/authorization";
import { createClient } from "@/lib/supabase/server";
import { estimateCostUsd } from "@/lib/ai/pricing";
import { UsageClient } from "./usage-client";
import { ShieldAlert } from "lucide-react";

export const metadata = {
  title: "AI Usage | De-Marco Studio",
};

export default async function AIUsagePage(props: {
  searchParams?: Promise<{ status?: string; task_type?: string }>;
}) {
  const context = await getCurrentUserContext();
  if (!context) {
    return <div className="p-8 text-on-surface">Access Denied</div>;
  }

  // Admin gate: Only Owner or Admin can access
  const isOwnerOrAdmin = context.role.name === "owner" || context.role.name === "admin";
  if (!isOwnerOrAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center animate-in fade-in duration-300">
        <div className="p-8 rounded-3xl bg-surface-container-low border border-outline-variant/30 text-on-surface shadow-clay max-w-md">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-title-lg font-bold mb-2">Access Denied</h2>
          <p className="text-body-md text-on-surface-variant">
            Only organization owners and administrators can access AI observability and telemetry logs.
          </p>
        </div>
      </div>
    );
  }

  const searchParams = await props.searchParams;
  const selectedStatus = searchParams?.status || "all";
  const selectedTaskType = searchParams?.task_type || "all";

  const supabase = await createClient();

  // Query aggregate statistics via RPC (efficient and accurate, bypasses PostgREST row limits)
  const { data: statsData, error: aggregateError } = await supabase
    .rpc("get_ai_usage_stats", { p_organization_id: context.organization.id });

  if (aggregateError) {
    console.error("Failed to query aggregate ai_runs stats via RPC:", aggregateError);
  }

  const stat = Array.isArray(statsData) ? statsData[0] : statsData;
  const totalRuns = Number(stat?.total_runs ?? 0);
  const totalErrors = Number(stat?.total_errors ?? 0);
  const totalPromptTokens = Number(stat?.total_prompt_tokens ?? 0);
  const totalCompletionTokens = Number(stat?.total_completion_tokens ?? 0);
  const totalTokens = Number(stat?.total_tokens ?? 0);

  const totalSuccess = Math.max(0, totalRuns - totalErrors);
  const successRate = totalRuns > 0 ? ((totalSuccess / totalRuns) * 100).toFixed(1) : "0";
  const estimatedCost = estimateCostUsd(totalPromptTokens, totalCompletionTokens);

  // Query 50 most recent runs
  let runsQuery = supabase
    .from("ai_runs")
    .select("id, created_at, task_type, status, error_message, provider, model, prompt_tokens, completion_tokens, total_tokens, duration_ms")
    .eq("organization_id", context.organization.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (selectedStatus && selectedStatus !== "all") {
    runsQuery = runsQuery.eq("status", selectedStatus);
  }
  if (selectedTaskType && selectedTaskType !== "all") {
    runsQuery = runsQuery.eq("task_type", selectedTaskType);
  }

  const { data: recentRuns, error: runsError } = await runsQuery;
  if (runsError) {
    console.error("Failed to fetch recent ai_runs:", runsError);
  }

  const aggregates = {
    totalRuns,
    totalErrors,
    totalSuccess,
    successRate,
    totalTokens,
    totalPromptTokens,
    totalCompletionTokens,
    estimatedCostUsd: estimatedCost,
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <UsageClient
        runs={recentRuns || []}
        aggregates={aggregates}
        selectedStatus={selectedStatus}
        selectedTaskType={selectedTaskType}
      />
    </div>
  );
}
