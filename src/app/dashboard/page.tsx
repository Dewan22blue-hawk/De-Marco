import { MotionDiv, MotionSection, containerVariants, itemVariants } from "@/components/ui/motion-wrapper"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient();

  const { count: activeCampaignsCount } = await supabase
    .from("campaigns")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")

  const { count: totalDesignsCount } = await supabase
    .from("designs")
    .select("*", { count: "exact", head: true })
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
              Welcome back, Marcus Vance <span className="inline-block hover:rotate-12 transition-transform cursor-pointer">👋</span>
            </h1>
            <p className="text-body-lg font-body-lg text-on-surface-variant leading-relaxed">
              Here is your omnichannel workspace pulse. All 14 active campaigns are tracking above target ROAS with 12 new AI variations awaiting deployment.
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

        {/* Inset KPI Strip */}
        <div className="mt-8 pt-6 border-t border-outline-variant/20 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="debossed-well rounded-2xl p-4 flex flex-col">
            <span className="text-label-code-sm font-label-code-sm text-on-surface-variant font-medium">BLENDED ROAS</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-[24px] font-label-code-md font-bold text-on-surface">4.82x</span>
              <span className="text-label-code-sm font-label-code-sm font-bold text-emerald-600 flex items-center">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span>+18.4%
              </span>
            </div>
            <span className="text-body-sm font-body-sm text-outline mt-0.5">Target: 3.50x benchmark</span>
          </div>

          <div className="debossed-well rounded-2xl p-4 flex flex-col">
            <span className="text-label-code-sm font-label-code-sm text-on-surface-variant font-medium">MONTHLY SPEND</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-[24px] font-label-code-md font-bold text-on-surface">$148,250</span>
              <span className="text-label-code-sm font-label-code-sm font-medium text-outline">/ $200k</span>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: "74.1%" }}></div>
            </div>
          </div>

          <div className="debossed-well rounded-2xl p-4 flex flex-col">
            <span className="text-label-code-sm font-label-code-sm text-on-surface-variant font-medium">CONVERSION VELOCITY</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-[24px] font-label-code-md font-bold text-on-surface">8,419</span>
              <span className="text-label-code-sm font-label-code-sm text-emerald-600 font-semibold">+312 today</span>
            </div>
            <span className="text-body-sm font-body-sm text-outline mt-0.5">Average CPA: $17.61</span>
          </div>

          <div className="debossed-well rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-label-code-sm font-label-code-sm text-on-surface-variant font-medium">FOUNDATION MODEL</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
              <span className="text-headline-sm font-headline-sm font-bold text-secondary">Claude 3.7 Sonnet</span>
            </div>
            <span className="text-label-code-sm font-label-code-sm text-on-surface-variant">Active Agent Pipeline</span>
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
            <a className="text-secondary font-headline-sm text-body-sm font-semibold flex items-center gap-1 group-hover:gap-1.5 transition-all" href="#ai-studio">
              <span className="">View</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>
        </div>

        {/* Card 3: Total Leads */}
        <div className="clay-surface rounded-3xl p-6 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-[24px]">groups</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-800 text-label-code-sm font-label-code-sm font-semibold">
                Validated
              </span>
            </div>
            <div className="mt-4">
              <span className="text-body-md font-headline-sm font-medium text-on-surface-variant">Total Leads</span>
              <div className="flex items-baseline gap-2.5 mt-1">
                <span className="text-[32px] font-label-code-md font-bold text-on-surface">8,942</span>
                <span className="text-label-code-sm font-label-code-sm font-semibold text-emerald-600">+12.6% vs mo</span>
              </div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-outline-variant/20 flex items-center justify-between">
            <span className="text-body-sm font-body-sm text-outline">Direct CRM sync</span>
            <a className="text-cyan-700 font-headline-sm text-body-sm font-semibold flex items-center gap-1 group-hover:gap-1.5 transition-all" href="#audiences">
              <span className="">View</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>
        </div>

        {/* Card 4: Proposals Sent */}
        <div className="clay-surface rounded-3xl p-6 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-[24px]">assignment_turned_in</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-label-code-sm font-label-code-sm font-semibold">
                Q3 Pacing
              </span>
            </div>
            <div className="mt-4">
              <span className="text-body-md font-headline-sm font-medium text-on-surface-variant">Proposals Sent</span>
              <div className="flex items-baseline gap-2.5 mt-1">
                <span className="text-[32px] font-label-code-md font-bold text-on-surface">384</span>
                <span className="text-label-code-sm font-label-code-sm font-semibold text-emerald-600">94.2% close</span>
              </div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-outline-variant/20 flex items-center justify-between">
            <span className="text-body-sm font-body-sm text-outline">$1.84M in pipeline</span>
            <a className="text-emerald-700 font-headline-sm text-body-sm font-semibold flex items-center gap-1 group-hover:gap-1.5 transition-all" href="#proposals">
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

          {/* SVG Line & Area Chart Container */}
          <div className="relative w-full h-64 select-none">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 760 220" preserveAspectRatio="none">
              <defs>
                <linearGradient id="roasAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.32"></stop>
                  <stop offset="70%" stopColor="#7C3AED" stopOpacity="0.08"></stop>
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.00"></stop>
                </linearGradient>
                <linearGradient id="velocityAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.22"></stop>
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.00"></stop>
                </linearGradient>
                <linearGradient id="lineStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4F46E5"></stop>
                  <stop offset="60%" stopColor="#7C3AED"></stop>
                  <stop offset="100%" stopColor="#06B6D4"></stop>
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
              <line x1="40" y1="30" x2="740" y2="30" stroke="#C7C4D8" strokeOpacity="0.3" strokeDasharray="3 4"></line>
              <line x1="40" y1="80" x2="740" y2="80" stroke="#C7C4D8" strokeOpacity="0.3" strokeDasharray="3 4"></line>
              <line x1="40" y1="130" x2="740" y2="130" stroke="#C7C4D8" strokeOpacity="0.3" strokeDasharray="3 4"></line>
              <line x1="40" y1="180" x2="740" y2="180" stroke="#C7C4D8" strokeOpacity="0.5"></line>

              {/* Target Benchmark Reference Line (3.50x ROAS) */}
              <line x1="40" y1="120" x2="740" y2="120" stroke="#712AE2" strokeWidth="1.5" strokeDasharray="6 4" strokeOpacity="0.75"></line>
              <text x="670" y="114" fill="#712AE2" fontSize="10" fontFamily="JetBrains Mono" fontWeight="600">Benchmark 3.50x</text>

              {/* Velocity Secondary Area (Cyan) */}
              <path d="M 40 160 C 100 150, 160 140, 220 125 C 280 110, 340 135, 400 100 C 460 70, 520 85, 580 60 C 640 45, 700 55, 740 40 L 740 180 L 40 180 Z" fill="url(#velocityAreaGrad)"></path>
              <path d="M 40 160 C 100 150, 160 140, 220 125 C 280 110, 340 135, 400 100 C 460 70, 520 85, 580 60 C 640 45, 700 55, 740 40" fill="none" stroke="#06B6D4" strokeWidth="2" strokeDasharray="4 3"></path>

              {/* ROAS Primary Area (Indigo to Violet) */}
              <path d="M 40 145 C 90 130, 150 95, 210 110 C 270 125, 330 75, 390 60 C 450 48, 510 65, 570 38 C 630 18, 690 35, 740 22 L 740 180 L 40 180 Z" fill="url(#roasAreaGrad)"></path>
              <path d="M 40 145 C 90 130, 150 95, 210 110 C 270 125, 330 75, 390 60 C 450 48, 510 65, 570 38 C 630 18, 690 35, 740 22" fill="none" stroke="url(#lineStroke)" strokeWidth="3.5" strokeLinecap="round"></path>

              {/* Data Nodes & Peak Markers */}
              <circle cx="40" cy="145" r="4" fill="#ffffff" stroke="#4F46E5" strokeWidth="2.5"></circle>
              <circle cx="210" cy="110" r="4" fill="#ffffff" stroke="#4F46E5" strokeWidth="2.5"></circle>
              <circle cx="390" cy="60" r="4" fill="#ffffff" stroke="#7C3AED" strokeWidth="2.5"></circle>
              <circle cx="570" cy="38" r="6" fill="#7C3AED" stroke="#ffffff" strokeWidth="2.5"></circle>
              <circle cx="740" cy="22" r="5" fill="#06B6D4" stroke="#ffffff" strokeWidth="2.5"></circle>

              {/* Floating Peak Tooltip */}
              <g transform="translate(505, -5)">
                <rect width="130" height="38" rx="10" fill="#213145" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.18))"></rect>
                <text x="10" y="16" fill="#CEDBF5" fontSize="10" fontFamily="Inter">Sat 21:00 • Peak ROAS</text>
                <text x="10" y="30" fill="#10B981" fontSize="12" fontFamily="JetBrains Mono" fontWeight="700">5.42x (+1.92x)</text>
              </g>

              {/* X Axis Labels */}
              <text x="40" y="200" fill="#777587" fontSize="11" fontFamily="JetBrains Mono" textAnchor="start">Mon 18</text>
              <text x="156" y="200" fill="#777587" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">Tue 19</text>
              <text x="272" y="200" fill="#777587" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">Wed 20</text>
              <text x="388" y="200" fill="#777587" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">Thu 21</text>
              <text x="504" y="200" fill="#777587" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">Fri 22</text>
              <text x="620" y="200" fill="#4F46E5" fontSize="11" fontFamily="JetBrains Mono" fontWeight="700" textAnchor="middle">Sat 23</text>
              <text x="740" y="200" fill="#777587" fontSize="11" fontFamily="JetBrains Mono" textAnchor="end">Sun 24</text>
            </svg>
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

        {/* Panel 2: Omnichannel Share & Attribution Donut (4 cols) */}
        <div className="lg:col-span-4 clay-surface rounded-3xl p-6 border border-white flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-headline-sm font-headline-sm text-on-surface tracking-tight font-bold">Omnichannel Share</h2>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">Attribution &amp; budget distribution</p>
            </div>
            <span className="p-1.5 rounded-xl bg-surface-container-high text-primary">
              <span className="material-symbols-outlined text-[18px]">pie_chart</span>
            </span>
          </div>

          {/* Donut Visualization with Center KPI */}
          <div className="relative flex items-center justify-center py-2">
            <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 160 160">
              {/* Background Track */}
              <circle cx="80" cy="80" r="62" stroke="#EFF4FF" strokeWidth="16" fill="none"></circle>
              {/* Meta Dynamic 42% */}
              <circle cx="80" cy="80" r="62" stroke="#4F46E5" strokeWidth="16" fill="none" strokeDasharray="163.6 225.9" strokeDashoffset="0" strokeLinecap="round"></circle>
              {/* TikTok Reels 34% */}
              <circle cx="80" cy="80" r="62" stroke="#7C3AED" strokeWidth="16" fill="none" strokeDasharray="132.4 257.1" strokeDashoffset="-167" strokeLinecap="round"></circle>
              {/* YouTube Shorts 18% */}
              <circle cx="80" cy="80" r="62" stroke="#06B6D4" strokeWidth="16" fill="none" strokeDasharray="70.1 319.4" strokeDashoffset="-303" strokeLinecap="round"></circle>
              {/* Google Search 6% */}
              <circle cx="80" cy="80" r="62" stroke="#10B981" strokeWidth="16" fill="none" strokeDasharray="23.4 366.1" strokeDashoffset="-376" strokeLinecap="round"></circle>
            </svg>

            {/* Center Metric Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-label-code-sm font-label-code-sm text-outline">TOTAL AD SPEND</span>
              <span className="text-[24px] font-label-code-md font-bold text-on-surface">$148.2k</span>
              <span className="text-[11px] font-label-code-sm text-emerald-600 font-semibold">94.2% close</span>
            </div>
          </div>

          {/* Channels Breakdown Legend */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-body-sm font-body-sm p-1.5 rounded-xl hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary shrink-0"></span>
                <span className="font-medium text-on-surface">Meta Dynamic Ads</span>
              </div>
              <div className="flex items-center gap-3 font-label-code-sm text-label-code-sm">
                <span className="font-bold text-on-surface">42%</span>
                <span className="text-outline">$62.2k</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-body-sm font-body-sm p-1.5 rounded-xl hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-secondary shrink-0"></span>
                <span className="font-medium text-on-surface">TikTok Reels Ads</span>
              </div>
              <div className="flex items-center gap-3 font-label-code-sm text-label-code-sm">
                <span className="font-bold text-on-surface">34%</span>
                <span className="text-outline">$50.4k</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-body-sm font-body-sm p-1.5 rounded-xl hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-500 shrink-0"></span>
                <span className="font-medium text-on-surface">YouTube Shorts</span>
              </div>
              <div className="flex items-center gap-3 font-label-code-sm text-label-code-sm">
                <span className="font-bold text-on-surface">18%</span>
                <span className="text-outline">$26.7k</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-body-sm font-body-sm p-1.5 rounded-xl hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="font-medium text-on-surface">Google Intent Search</span>
              </div>
              <div className="flex items-center gap-3 font-label-code-sm text-label-code-sm">
                <span className="font-bold text-on-surface">6%</span>
                <span className="text-outline">$8.9k</span>
              </div>
            </div>
          </div>

          {/* AI Optimization Advice Pill */}
          <div className="debossed-well rounded-2xl p-3 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">psychology</span>
            <div className="text-[11px] leading-relaxed text-on-surface-variant font-body-sm">
              <span className="font-bold text-on-surface">AI Recommendation:</span> Reallocate +$1,200 from Google Search to TikTok Reels to capture surge in 18-24 age cohort.
            </div>
          </div>
        </div>
      </MotionSection>

      {/* 4. RECENT ACTIVITIES STREAM */}
      <MotionSection variants={itemVariants} className="clay-surface rounded-3xl p-6 border border-white">
        {/* Stream Header & Inset Filter Track */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h2 className="text-headline-sm font-headline-sm text-on-surface tracking-tight">Recent Workspace Activities</h2>
          </div>
          {/* Filter Tabs inside Inset Debossed Container */}
          <div className="debossed-well p-1 rounded-2xl flex items-center gap-1 self-start sm:self-auto">
            <button className="px-3.5 py-1.5 rounded-xl bg-white text-primary font-headline-sm text-body-sm font-bold shadow-sm">All</button>
            <button className="px-3.5 py-1.5 rounded-xl text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm font-medium transition-colors">Creative</button>
            <button className="px-3.5 py-1.5 rounded-xl text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm font-medium transition-colors">Lead</button>
            <button className="px-3.5 py-1.5 rounded-xl text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm font-medium transition-colors">Campaign</button>
          </div>
        </div>

        {/* Stream Item List */}
        <div className="divide-y divide-outline-variant/15">
          {/* Item 1: Creative Drop */}
          <div className="py-5 flex items-start gap-4 group hover:bg-surface-container-low/50 -mx-4 px-4 rounded-2xl transition-colors">
            <div className="w-11 h-11 rounded-2xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-body-md font-headline-sm font-bold text-on-surface truncate">New AI Creative Drop Synthesized</span>
                <span className="text-label-code-sm font-label-code-sm text-outline shrink-0">12m ago</span>
              </div>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
                12 multi-aspect dynamic ads for Summer Tactile Ceramic Eyewear generated with responsive variations.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-label-code-sm font-label-code-sm font-semibold border border-secondary/20">
                  Ready for Review
                </span>
                <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant text-label-code-sm font-label-code-sm font-medium">
                  Claude 3.7 Sonnet
                </span>
                <span className="text-label-code-sm font-label-code-sm text-outline">Meta &amp; TikTok 9:16</span>
              </div>
            </div>
          </div>

          {/* Item 2: Lead Captured */}
          <div className="py-5 flex items-start gap-4 group hover:bg-surface-container-low/50 -mx-4 px-4 rounded-2xl transition-colors">
            <div className="w-11 h-11 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <span className="material-symbols-outlined text-[22px]">person_search</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-body-md font-headline-sm font-bold text-on-surface truncate">Enterprise Growth Tier Lead Captured</span>
                <span className="text-label-code-sm font-label-code-sm text-outline shrink-0">45m ago</span>
              </div>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
                Kinetic Labs inbound proposal request routed to sales pool with enriched firmographic data.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-900 text-label-code-sm font-label-code-sm font-semibold border border-cyan-300">
                  High Intent
                </span>
                <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant text-label-code-sm font-label-code-sm font-medium">
                  Lead Engine v4
                </span>
                <span className="text-label-code-sm font-label-code-sm text-outline">Score: 98/100</span>
              </div>
            </div>
          </div>

          {/* Item 3: TikTok Velocity Surge */}
          <div className="py-5 flex items-start gap-4 group hover:bg-surface-container-low/50 -mx-4 px-4 rounded-2xl transition-colors">
            <div className="w-11 h-11 rounded-2xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <span className="material-symbols-outlined text-[22px]">trending_up</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-body-md font-headline-sm font-bold text-on-surface truncate">TikTok Reels Velocity Surge</span>
                <span className="text-label-code-sm font-label-code-sm text-outline shrink-0">2h ago</span>
              </div>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
                Omnichannel burst campaign reached 4.92% CTR benchmark. Dynamic budget scaled +$2,500/day.
              </p>
            </div>
          </div>
        </div>
      </MotionSection>
    </MotionDiv>
  )
}
