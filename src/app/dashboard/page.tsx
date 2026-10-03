import { MotionDiv, MotionSection, containerVariants, itemVariants } from "@/components/ui/motion-wrapper"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUserContext } from "@/lib/auth/authorization"
import { redirect } from "next/navigation"
import ActivityStream from "./activity-stream"
export default async function DashboardPage() {
  const context = await getCurrentUserContext()

  if (!context) redirect("/login?error=organization")

  const supabase = await createClient();

  const [
    { count: activeCampaignsCount },
    { count: totalDesignsCount },
    { count: totalTemplatesCount },
    { count: totalAssetsCount },
    { data: recentCampaigns },
    { data: allTemplates },
    { data: recentDesigns },
    { data: recentTemplates }
  ] = await Promise.all([
    supabase.from("campaigns").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("designs").select("*", { count: "exact", head: true }),
    supabase.from("templates").select("*", { count: "exact", head: true }),
    supabase.from("assets").select("*", { count: "exact", head: true }),
    supabase.from("campaigns").select("id, name, status, created_at").order("created_at", { ascending: false }).limit(4),
    supabase.from("templates").select("template_type"),
    supabase.from("designs").select("id, name, status, created_at").order("created_at", { ascending: false }).limit(4),
    supabase.from("templates").select("id, name, template_type, created_at").order("created_at", { ascending: false }).limit(4)
  ]);

  const activities = [
    ...(recentCampaigns || []).map(c => ({ ...c, type: 'campaign' as const })),
    ...(recentDesigns || []).map(d => ({ ...d, type: 'creative' as const })),
    ...(recentTemplates || []).map(t => ({ ...t, type: 'template' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Generate 7-day chart data based on real campaigns
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(date => {
    const count = recentCampaigns?.filter(c => c.created_at.startsWith(date)).length || 0;
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      count
    };
  });
  const maxChartValue = Math.max(...chartData.map(d => d.count), 5);

  // Group templates for the donut chart
  const templateTypes = allTemplates?.reduce((acc, curr) => {
    const type = curr.template_type || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};
  const totalTemplates = Object.values(templateTypes).reduce((a, b) => a + b, 0);
  return (
    <MotionDiv
      className="space-y-8 pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 1. WELCOME & PERFORMANCE HERO BANNER (Tactile Clay Card) */}
      <MotionSection variants={itemVariants} className="clay-surface-neural rounded-3xl p-8 relative overflow-hidden border border-white">
        {/* Ambient radial glow behind AI elements */}
        <div className="absolute -right-16 -top-16 w-96 h-96 bg-gradient-to-br from-secondary/15 via-primary/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-gradient-to-tr from-tertiary-fixed-dim/20 to-transparent rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-label-code-sm font-label-code-sm font-semibold text-emerald-800">Supabase Live Edge Active • Latency: 38ms</span>
            </div>
            <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">
              Welcome back, {context.profile.full_name || 'User'} <span className="inline-block hover:rotate-12 transition-transform cursor-pointer">👋</span>
            </h1>
            <p className="text-body-lg font-body-lg text-on-surface-variant leading-relaxed">
              Here is your omnichannel workspace pulse. All {activeCampaignsCount || 0} active campaigns are tracking above target ROAS with new AI variations awaiting deployment.
            </p>
          </div>
          {/* Hero Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button className="clay-button-neural px-5 py-3 rounded-2xl text-white font-headline-sm text-body-md font-semibold flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <span className="">Open AI Studio</span>
            </button>
            <button className="px-4 py-3 rounded-2xl bg-white hover:bg-surface-container font-headline-sm text-body-md font-semibold text-on-surface border border-outline-variant/40 shadow-sm transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-outline">tune</span>
              <span className="">Filter Metrics</span>
            </button>
          </div>
        </div>


      </MotionSection>

      {/* 2. EXECUTIVE KPI GRID (4 Tactile Clay Stat Cards) */}
      <MotionSection variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Card 1: Active Campaigns */}
        <div className="clay-surface rounded-3xl p-6 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-[24px]">campaign</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-label-code-sm font-label-code-sm font-semibold">
                Omnichannel
              </span>
            </div>
            <div className="mt-4">
              <span className="text-body-md font-headline-sm font-medium text-on-surface-variant">Active Campaigns</span>
              <div className="flex items-baseline gap-2.5 mt-1">
                <span className="text-[32px] font-label-code-md font-bold text-on-surface">{activeCampaignsCount || 0}</span>
                <span className="text-label-code-sm font-label-code-sm font-semibold text-emerald-600">+3 new this week</span>
              </div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-outline-variant/20 flex items-center justify-between">
            <span className="text-body-sm font-body-sm text-outline">Across 4 ad networks</span>
            <a className="text-primary font-headline-sm text-body-sm font-semibold flex items-center gap-1 group-hover:gap-1.5 transition-all" href="#campaigns">
              <span className="">View</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>
        </div>

        {/* Card 2: Designs Created */}
        <div className="clay-surface rounded-3xl p-6 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-[24px]">palette</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-label-code-sm font-label-code-sm font-semibold">
                AI Synced
              </span>
            </div>
            <div className="mt-4">
              <span className="text-body-md font-headline-sm font-medium text-on-surface-variant">Designs Created</span>
              <div className="flex items-baseline gap-2.5 mt-1">
                <span className="text-[32px] font-label-code-md font-bold text-on-surface">{totalDesignsCount || 0}</span>
                <span className="text-label-code-sm font-label-code-sm font-semibold text-emerald-600">+18.4% velocity</span>
              </div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-outline-variant/20 flex items-center justify-between">
            <span className="text-body-sm font-body-sm text-outline">12 awaiting review</span>
            <a className="text-secondary font-headline-sm text-body-sm font-semibold flex items-center gap-1 group-hover:gap-1.5 transition-all" href="/dashboard/designs">
              <span className="">View</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>
        </div>

        {/* Card 3: Total Templates */}
        <div className="clay-surface rounded-3xl p-6 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-[24px]">style</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-800 text-label-code-sm font-label-code-sm font-semibold">
                Library
              </span>
            </div>
            <div className="mt-4">
              <span className="text-body-md font-headline-sm font-medium text-on-surface-variant">Total Templates</span>
              <div className="flex items-baseline gap-2.5 mt-1">
                <span className="text-[32px] font-label-code-md font-bold text-on-surface">{totalTemplatesCount || 0}</span>
              </div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-outline-variant/20 flex items-center justify-between">
            <span className="text-body-sm font-body-sm text-outline">Across all categories</span>
            <a className="text-cyan-700 font-headline-sm text-body-sm font-semibold flex items-center gap-1 group-hover:gap-1.5 transition-all" href="#templates">
              <span className="">View</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>
        </div>

        {/* Card 4: Total Assets */}
        <div className="clay-surface rounded-3xl p-6 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-[24px]">folder_special</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-label-code-sm font-label-code-sm font-semibold">
                Storage
              </span>
            </div>
            <div className="mt-4">
              <span className="text-body-md font-headline-sm font-medium text-on-surface-variant">Total Assets</span>
              <div className="flex items-baseline gap-2.5 mt-1">
                <span className="text-[32px] font-label-code-md font-bold text-on-surface">{totalAssetsCount || 0}</span>
              </div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-outline-variant/20 flex items-center justify-between">
            <span className="text-body-sm font-body-sm text-outline">Images &amp; Videos</span>
            <a className="text-emerald-700 font-headline-sm text-body-sm font-semibold flex items-center gap-1 group-hover:gap-1.5 transition-all" href="#assets">
              <span className="">View</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>
        </div>
      </MotionSection>

      {/* 3. MAIN WORKSPACE SPLIT (2-Column Grid: 8 cols / 4 cols) */}
      <MotionSection variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Panel 1: Real-Time ROAS & Conversion Velocity (8 cols) */}
        <div className="lg:col-span-8 clay-surface rounded-3xl p-6 border border-white flex flex-col justify-between space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                <h2 className="text-headline-sm font-headline-sm text-on-surface tracking-tight font-bold">Real-Time ROAS &amp; Conversion Velocity</h2>
              </div>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Live multi-channel telemetry vs target ROAS benchmark (3.50x)</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="debossed-well p-1 rounded-2xl flex items-center gap-1">
                <button className="px-3 py-1 rounded-xl text-on-surface-variant hover:text-on-surface font-label-code-sm text-label-code-sm font-medium transition-colors">24h</button>
                <button className="px-3 py-1 rounded-xl bg-white text-primary font-label-code-sm text-label-code-sm font-bold shadow-sm">7d</button>
                <button className="px-3 py-1 rounded-xl text-on-surface-variant hover:text-on-surface font-label-code-sm text-label-code-sm font-medium transition-colors">30d</button>
                <button className="px-3 py-1 rounded-xl text-on-surface-variant hover:text-on-surface font-label-code-sm text-label-code-sm font-medium transition-colors">Quarter</button>
              </div>
            </div>
          </div>

          {/* Peak Metrics Ribbon */}
          <div className="grid grid-cols-3 gap-3">
            <div className="debossed-well rounded-2xl p-3 flex flex-col">
              <span className="text-label-code-sm font-label-code-sm text-outline">PEAK ROAS</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-[20px] font-label-code-md font-bold text-on-surface">5.42x</span>
                <span className="text-[11px] font-label-code-sm font-semibold text-emerald-600">Sat 21:00</span>
              </div>
            </div>
            <div className="debossed-well rounded-2xl p-3 flex flex-col">
              <span className="text-label-code-sm font-label-code-sm text-outline">AVG CONVERSIONS</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-[20px] font-label-code-md font-bold text-on-surface">1,202/d</span>
                <span className="text-[11px] font-label-code-sm font-semibold text-primary">+24% wk</span>
              </div>
            </div>
            <div className="debossed-well rounded-2xl p-3 flex flex-col">
              <span className="text-label-code-sm font-label-code-sm text-outline">TARGET BENCHMARK</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-[20px] font-label-code-md font-bold text-secondary">3.50x</span>
                <span className="text-[11px] font-label-code-sm font-semibold text-emerald-600">+37.7% Ahead</span>
              </div>
            </div>
          </div>

          {/* Dynamic CSS Bar Chart */}
          <div className="relative w-full h-64 select-none flex items-end justify-between pb-6 pt-4 gap-2">
            {chartData.map((data, index) => {
              const heightPct = Math.max((data.count / maxChartValue) * 100, 2); // Min 2% height for visibility
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="w-full flex justify-center h-48 items-end relative group">
                    <div className="w-full max-w-[48px] bg-primary/20 hover:bg-primary transition-all duration-300 rounded-t-xl relative border-t-2 border-primary" style={{ height: `${heightPct}%` }}>
                      {/* Tooltip on hover */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface-container-highest text-on-surface text-label-code-sm font-label-code-sm px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm">
                        {data.count} items
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-label-code-sm text-outline mt-3 font-medium">{data.date}</span>
                </div>
              )
            })}
          </div>

          {/* Chart Legend & Real-Time Sync Status */}
          <div className="pt-4 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-body-sm font-body-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-secondary"></span>
                <span className="font-medium text-on-surface">Blended ROAS (Current: 4.82x)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1.5 rounded-full bg-cyan-500"></span>
                <span className="font-medium text-on-surface-variant">Conversion Velocity</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 border-t border-dashed border-secondary"></span>
                <span className="font-medium text-outline text-[12px]">Target Benchmark</span>
              </div>
            </div>
            <span className="text-label-code-sm font-label-code-sm text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Stream Synced 12s ago
            </span>
          </div>
        </div>

        {/* Panel 2: Template Distribution (4 cols) */}
        <div className="lg:col-span-4 clay-surface rounded-3xl p-6 border border-white flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-headline-sm font-headline-sm text-on-surface tracking-tight font-bold">Template Distribution</h2>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">Library breakdown by type</p>
            </div>
            <span className="p-1.5 rounded-xl bg-surface-container-high text-primary">
              <span className="material-symbols-outlined text-[18px]">style</span>
            </span>
          </div>

          {/* Center Metric */}
          <div className="flex flex-col items-center justify-center text-center py-8">
            <span className="text-label-code-sm font-label-code-sm text-outline">TOTAL TEMPLATES</span>
            <span className="text-[32px] font-label-code-md font-bold text-on-surface">{totalTemplates}</span>
          </div>

          {/* Channels Breakdown Legend */}
          <div className="space-y-2.5">
            {Object.entries(templateTypes).length === 0 ? (
              <div className="text-center text-body-sm text-outline py-4">No templates available.</div>
            ) : (
              Object.entries(templateTypes).map(([type, count], i) => {
                const colors = ['bg-primary', 'bg-secondary', 'bg-cyan-500', 'bg-emerald-500'];
                const colorClass = colors[i % colors.length];
                const percentage = totalTemplates > 0 ? Math.round((count / totalTemplates) * 100) : 0;

                return (
                  <div key={type} className="flex items-center justify-between text-body-sm font-body-sm p-1.5 rounded-xl hover:bg-surface-container-low transition-colors">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${colorClass} shrink-0`}></span>
                      <span className="font-medium text-on-surface capitalize">{type}</span>
                    </div>
                    <div className="flex items-center gap-3 font-label-code-sm text-label-code-sm">
                      <span className="font-bold text-on-surface">{percentage}%</span>
                      <span className="text-outline">{count}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </MotionSection>

      {/* 4. RECENT ACTIVITIES STREAM (Client Component for Tab filtering) */}
      <ActivityStream activities={activities} />
    </MotionDiv>
  )
}
