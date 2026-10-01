"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Unauthorized")

  const updates = {
    full_name: formData.get("full_name") as string,
    job_title: formData.get("job_title") as string,
    phone: formData.get("phone") as string,
    bio: formData.get("bio") as string,
    timezone: formData.get("timezone") as string,
    locale: formData.get("locale") as string,
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/settings/profile")
  // also revalidate root dashboard as it affects the sidebar profile
  revalidatePath("/dashboard", "layout")
  return { success: true }
}
