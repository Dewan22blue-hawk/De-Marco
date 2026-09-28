'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveBrandKit(formData: FormData) {
  const supabase = await createClient()

  const primary_color = formData.get('primary_color') as string
  const secondary_color = formData.get('secondary_color') as string
  const accent_color = formData.get('accent_color') as string
  const heading_font = formData.get('heading_font') as string
  const body_font = formData.get('body_font') as string

  // Asumsikan ada satu organisasi utama jika user login untuk MVP ini
  const { data: userData } = await supabase.auth.getUser()
  
  if (!userData.user) {
    throw new Error("Unauthorized")
  }

  // Insert or update logic
  const { error } = await supabase
    .from('brands')
    .upsert({
      name: "Default Brand",
      primary_color,
      secondary_color,
      accent_color,
      heading_font,
      body_font,
      updated_at: new Date().toISOString()
    }, { onConflict: 'name' })

  if (error) {
    console.error(error)
    throw new Error("Failed to save brand settings")
  }
  
  revalidatePath('/brand')
  
  return { success: true }
}
