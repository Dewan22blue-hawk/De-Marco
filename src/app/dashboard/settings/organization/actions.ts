"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateOrganization(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Unauthorized")

  const orgId = formData.get("id") as string
  
  // Verify membership
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role_id")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    throw new Error("You do not have permission to edit this organization.")
  }

  const updates = {
    name: formData.get("name") as string,
    legal_name: formData.get("legal_name") as string,
    industry: formData.get("industry") as string,
    website: formData.get("website") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    province: formData.get("province") as string,
    postal_code: formData.get("postal_code") as string,
  }

  const { error } = await supabase
    .from("organizations")
    .update(updates)
    .eq("id", orgId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/settings/organization")
  return { success: true }
}
