"use client";

import { useState } from "react";
import { MotionSection, itemVariants } from "@/components/ui/motion-wrapper";

type Activity = {
  id: string;
  name: string;
  status?: string;
  template_type?: string;
  created_at: string;
  type: "campaign" | "creative" | "template";
};

export default function ActivityStream({ activities }: { activities: Activity[] }) {
  const [activeTab, setActiveTab] = useState<"all" | "creative" | "template" | "campaign">("all");

  const filteredActivities = activities.filter((activity) => {
    if (activeTab === "all") return true;
    return activity.type === activeTab;
  });

  return (
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
          {(["all", "creative", "template", "campaign"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl font-body-sm text-body-sm transition-colors capitalize ${
                activeTab === tab
                  ? "bg-white text-primary font-bold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface font-medium"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Stream Item List */}
      <div className="divide-y divide-outline-variant/15">
        {filteredActivities.length === 0 ? (
          <div className="py-8 text-center text-body-sm font-body-sm text-on-surface-variant">
            No activities found for this category.
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div
              key={`${activity.type}-${activity.id}`}
              className="py-5 flex items-start gap-4 group hover:bg-surface-container-low/50 -mx-4 px-4 rounded-2xl transition-colors"
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm mt-0.5 ${
                  activity.type === "campaign"
                    ? "bg-secondary-fixed text-on-secondary-fixed"
                    : activity.type === "creative"
                    ? "bg-primary/10 text-primary"
                    : "bg-cyan-100 text-cyan-800"
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {activity.type === "campaign"
                    ? "campaign"
                    : activity.type === "creative"
                    ? "palette"
                    : "style"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-body-md font-headline-sm font-bold text-on-surface truncate">
                    {activity.name || `Untitled ${activity.type}`}
                  </span>
                  <span className="text-label-code-sm font-label-code-sm text-outline shrink-0">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
                  {activity.type === "campaign"
                    ? `Campaign has been updated to status: ${activity.status}.`
                    : activity.type === "creative"
                    ? `New design created and currently in ${activity.status} state.`
                    : `New template added of type: ${activity.template_type}.`}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-label-code-sm font-label-code-sm font-semibold border ${
                      activity.type === "campaign"
                        ? "bg-secondary/10 text-secondary border-secondary/20"
                        : activity.type === "creative"
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-cyan-50 text-cyan-700 border-cyan-200"
                    }`}
                  >
                    {activity.status || activity.template_type || activity.type}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </MotionSection>
  );
}
