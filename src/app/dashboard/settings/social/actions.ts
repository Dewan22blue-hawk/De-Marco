"use server"

import { revalidatePath } from "next/cache"
import { SocialService } from "@/lib/social"
import { createClient } from "@/lib/supabase/server"

export async function connectSocialAccountAction(formData: FormData) {
  const platform = formData.get("platform") as string
  const account_name = formData.get("account_name") as string
  const account_id = formData.get("account_id") as string
  const access_token = formData.get("access_token") as string

  if (!platform || !account_name || !account_id || !access_token) {
    throw new Error("Missing required fields")
  }

  await SocialService.connectAccount({
    platform,
    account_name,
    account_id,
    access_token
  })

  revalidatePath("/dashboard/settings/social")
}

export async function deleteSocialAccountAction(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("social_accounts")
    .delete()
    .eq("id", id)

  if (error) {
    throw new Error("Failed to delete account")
  }

  revalidatePath("/dashboard/settings/social")
}
