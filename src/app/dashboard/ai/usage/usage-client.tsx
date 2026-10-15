"use client"

import { useState, useTransition } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Activity,
  Zap,
  CheckCircle2,
  Coins,
  DollarSign,
  AlertCircle,
  Clock,
  Settings,
  ChevronRight,
  X,
  FilterX
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { CustomSelect } from "@/components/ui/custom-select"

export interface AIRunItem {
  id: string
  created_at: string
  task_type: string
  status: string
  error_message: string | null
  provider: string | null
  model: string | null
  prompt_tokens: number | null
  completion_tokens: number | null
  total_tokens: number | null
  duration_ms: number | null
}

export interface AIAggregates {
  totalRuns: number
  totalErrors: number
  totalSuccess: number
  successRate: string
  totalTokens: number
  totalPromptTokens: number
  totalCompletionTokens: number
  estimatedCostUsd: number
}

interface UsageClientProps {
  runs: AIRunItem[]
  aggregates: AIAggregates
  selectedStatus: string
  selectedTaskType: string
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "success", label: "Success" },
  { value: "error", label: "Error" },
]

const TASK_TYPE_OPTIONS = [
  { value: "all", label: "All Task Types" },
  { value: "content_generation", label: "Content Generation" },
  { value: "design_suggestion", label: "Design Suggestion" },
  { value: "analysis", label: "Analysis" },
  { value: "strategy", label: "Strategy" },
]

export function UsageClient({
  runs,
  aggregates,
  selectedStatus,
  selectedTaskType,
}: UsageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [selectedRun, setSelectedRun] = useState<AIRunItem | null>(null)

  const handleFilterChange = (updates: { status?: string; task_type?: string }) => {
    const nextStatus = updates.status !== undefined ? updates.status : selectedStatus
    const nextTaskType = updates.task_type !== undefined ? updates.task_type : selectedTaskType

    const params = new URLSearchParams()
    if (nextStatus && nextStatus !== "all") params.set("status", nextStatus)
    if (nextTaskType && nextTaskType !== "all") params.set("task_type", nextTaskType)

    startTransition(() => {
      const queryString = params.toString()
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
    })
  }

  const handleResetFilters = () => {
    startTransition(() => {
      router.replace(pathname, { scroll: false })
    })
  }

  const hasActiveFilters = selectedStatus !== "all" || selectedTaskType !== "all"

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <Activity className="w-6 h-6" />
            </div>
            <h1 className="text-display-sm font-bold text-on-surface">AI Usage & Observability</h1>
          </div>
          <p className="text-body-md text-on-surface-variant max-w-2xl">
            Live telemetry and execution metrics for Gemini AI operations. Monitor performance, latency, token usage, and costs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/settings/ai"
            className="clay-button inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium text-on-surface hover:text-primary transition-colors bg-surface-container-low border border-outline-variant/30"
          >
            <Settings className="w-4 h-4" />
            <span>AI Settings</span>
          </Link>
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Runs */}
        <Card className="flex flex-col justify-between gap-4 p-6 bg-surface-container-low border border-outline-variant/20">
          <div className="flex items-center justify-between">
            <span className="text-label-md font-medium text-on-surface-variant">Total AI Runs</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-headline-md font-bold text-on-surface">
              {aggregates.totalRuns.toLocaleString()}
            </span>
            <span className="text-xs text-on-surface-variant mt-1">
              {aggregates.totalSuccess} success · {aggregates.totalErrors} errors
            </span>
          </div>
        </Card>

        {/* Success Rate */}
        <Card className="flex flex-col justify-between gap-4 p-6 bg-surface-container-low border border-outline-variant/20">
          <div className="flex items-center justify-between">
            <span className="text-label-md font-medium text-on-surface-variant">Success Rate</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-headline-md font-bold text-on-surface">
              {aggregates.successRate}%
            </span>
            <span className="text-xs text-on-surface-variant mt-1">
              {aggregates.totalErrors === 0 ? "Zero operational errors" : `${aggregates.totalErrors} failed run(s)`}
            </span>
          </div>
        </Card>

        {/* Total Tokens */}
        <Card className="flex flex-col justify-between gap-4 p-6 bg-surface-container-low border border-outline-variant/20">
          <div className="flex items-center justify-between">
            <span className="text-label-md font-medium text-on-surface-variant">Total Tokens</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-headline-md font-bold text-on-surface">
              {aggregates.totalTokens.toLocaleString()}
            </span>
            <span className="text-xs text-on-surface-variant mt-1 truncate" title={`Prompt: ${aggregates.totalPromptTokens.toLocaleString()} | Completion: ${aggregates.totalCompletionTokens.toLocaleString()}`}>
              In: {aggregates.totalPromptTokens.toLocaleString()} · Out: {aggregates.totalCompletionTokens.toLocaleString()}
            </span>
          </div>
        </Card>

        {/* Estimated Cost */}
        <Card className="flex flex-col justify-between gap-4 p-6 bg-surface-container-low border border-outline-variant/20">
          <div className="flex items-center justify-between">
            <span className="text-label-md font-medium text-on-surface-variant">Estimated Cost</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-headline-md font-bold text-on-surface">
              ${aggregates.estimatedCostUsd.toFixed(4)}
            </span>
            <span className="text-xs text-on-surface-variant mt-1">
              Estimated (~$0.075 / $0.30 per 1M)
            </span>
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-44">
            <CustomSelect
              value={selectedStatus}
              onChange={(val) => handleFilterChange({ status: val })}
              options={STATUS_OPTIONS}
              placeholder="Status"
            />
          </div>

          <div className="w-52">
            <CustomSelect
              value={selectedTaskType}
              onChange={(val) => handleFilterChange({ task_type: val })}
              options={TASK_TYPE_OPTIONS}
              placeholder="Task Type"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
            >
              <FilterX className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>

        <div className="text-xs text-on-surface-variant self-center sm:self-auto">
          Showing {runs.length} most recent {runs.length === 1 ? "run" : "runs"}
        </div>
      </div>

      {/* Runs Table */}
      <div className="clay-surface rounded-3xl overflow-hidden border border-outline-variant/20 shadow-clay">
        {runs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant mb-4">
              <Activity className="w-7 h-7" />
            </div>
            <h3 className="text-title-md font-bold text-on-surface mb-1">No AI Runs Recorded</h3>
            <p className="text-body-sm text-on-surface-variant max-w-md">
              {hasActiveFilters
                ? "No AI runs match the selected filters. Try resetting the status or task type filters."
                : "When users generate marketing content or designs using AI, execution telemetry and token usage will appear here automatically."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                  <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Timestamp</th>
                  <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Task Type</th>
                  <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">Model</th>
                  <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Tokens</th>
                  <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Duration</th>
                  <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => {
                  const isSuccess = run.status === "success"
                  const formattedDate = new Date(run.created_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })

                  return (
                    <tr
                      key={run.id}
                      className="border-b border-outline-variant/10 hover:bg-surface-container-lowest transition-colors group"
                    >
                      {/* Timestamp */}
                      <td className="p-4 text-sm font-medium text-on-surface whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-on-surface-variant/70 shrink-0" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      {/* Task Type */}
                      <td className="p-4 text-sm text-on-surface whitespace-nowrap capitalize">
                        <span className="font-semibold text-xs px-2.5 py-1 rounded-lg bg-surface-container text-on-surface">
                          {run.task_type.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${
                            isSuccess
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {isSuccess ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              Success
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              Error
                            </>
                          )}
                        </span>
                      </td>

                      {/* Model */}
                      <td className="p-4 text-xs text-on-surface-variant hidden sm:table-cell whitespace-nowrap">
                        <span className="font-mono">{run.model || "gemini-3.1-flash-lite"}</span>
                      </td>

                      {/* Tokens */}
                      <td className="p-4 text-sm text-on-surface hidden md:table-cell whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {(run.total_tokens ?? 0).toLocaleString()}
                          </span>
                          <span className="text-[11px] text-on-surface-variant">
                            {run.prompt_tokens ?? 0} in / {run.completion_tokens ?? 0} out
                          </span>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="p-4 text-sm text-on-surface whitespace-nowrap">
                        <span className="font-mono text-xs">
                          {run.duration_ms !== null ? `${run.duration_ms} ms` : "-"}
                        </span>
                      </td>

                      {/* Action Details */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedRun(run)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-primary hover:bg-primary/10 transition-colors"
                        >
                          <span>View</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-surface rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${selectedRun.status === "success" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
                  {selectedRun.status === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-title-md font-bold text-on-surface">AI Run Details</h3>
                  <p className="text-xs text-on-surface-variant font-mono">{selectedRun.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRun(null)}
                className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface-container-low border border-outline-variant/10">
                <span className="text-xs text-on-surface-variant">Task Type</span>
                <span className="font-semibold text-on-surface capitalize">{selectedRun.task_type.replace(/_/g, " ")}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface-container-low border border-outline-variant/10">
                <span className="text-xs text-on-surface-variant">Status</span>
                <span className={`font-semibold capitalize ${selectedRun.status === "success" ? "text-emerald-600" : "text-rose-600"}`}>
                  {selectedRun.status}
                </span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface-container-low border border-outline-variant/10">
                <span className="text-xs text-on-surface-variant">Model</span>
                <span className="font-semibold text-on-surface font-mono text-xs">{selectedRun.model || "gemini-3.1-flash-lite"}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface-container-low border border-outline-variant/10">
                <span className="text-xs text-on-surface-variant">Duration</span>
                <span className="font-semibold text-on-surface">{selectedRun.duration_ms !== null ? `${selectedRun.duration_ms} ms` : "-"}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface-container-low border border-outline-variant/10">
                <span className="text-xs text-on-surface-variant">Prompt Tokens</span>
                <span className="font-semibold text-on-surface">{(selectedRun.prompt_tokens ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface-container-low border border-outline-variant/10">
                <span className="text-xs text-on-surface-variant">Completion Tokens</span>
                <span className="font-semibold text-on-surface">{(selectedRun.completion_tokens ?? 0).toLocaleString()}</span>
              </div>
            </div>

            {selectedRun.error_message && (
              <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Sanitized Error Message
                </span>
                <p className="text-xs font-mono break-words leading-relaxed whitespace-pre-wrap">
                  {selectedRun.error_message}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRun(null)}
                className="px-5 py-2.5 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high text-sm font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
