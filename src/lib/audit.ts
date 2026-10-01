import { createClient } from "./supabase/server";

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export';

export async function createAuditLog(data: {
  organization_id?: string;
  table_name: string;
  record_id?: string;
  action: AuditAction;
  old_data?: any;
  new_data?: any;
  ip_address?: string;
  user_agent?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from("audit_logs").insert({
    organization_id: data.organization_id,
    user_id: user?.id,
    table_name: data.table_name,
    record_id: data.record_id,
    action: data.action,
    old_data: data.old_data,
    new_data: data.new_data,
    ip_address: data.ip_address,
    user_agent: data.user_agent,
  });

  if (error) {
    console.error("Failed to create audit log:", error);
  }
}
