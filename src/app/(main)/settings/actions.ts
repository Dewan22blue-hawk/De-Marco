'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function logout() {
  const supabase = await createClient()

  // Sign out the current session
  await supabase.auth.signOut()

  // Redirect to login page
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const full_name = formData.get('full_name') as string
  const bio = formData.get('bio') as string

  const { error } = await supabase
    .from('profiles')
    .update({ 
      full_name, 
      bio,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    console.error("Failed to update profile", error)
    // Silently log or return error in advanced impl
  }

  revalidatePath('/settings')
}
