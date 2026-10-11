import Link from "next/link";
import { Activity } from "lucide-react";
import { AISettingsClient } from "./ai-settings-client";
import { getCurrentUserContext } from "@/lib/auth/authorization";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "AI Integration | De-Marco Studio",
};

export default async function AISettingsPage() {
  const context = await getCurrentUserContext();
  if (!context) {
    return <div>Access Denied</div>;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from('ai_settings')
    .select('id')
    .eq('organization_id', context.organization.id)
    .eq('provider', 'gemini')
    .maybeSingle();

  const hasGeminiKey = !!data;
  
  // Organization Owner/Admin mapping:
  const isOwnerOrAdmin = context.role.name === 'owner' || context.role.name === 'admin';

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-end">
        <Link
          href="/dashboard/ai/usage"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-on-surface bg-surface-container hover:bg-surface-container-high rounded-xl border border-outline-variant/30 transition-colors shadow-sm"
        >
          <Activity className="w-4 h-4 text-primary" />
          <span>View AI Usage & Observability</span>
        </Link>
      </div>
      <AISettingsClient 
        hasGeminiKey={hasGeminiKey} 
        isOwnerOrAdmin={isOwnerOrAdmin} 
      />
    </div>
  );
}
