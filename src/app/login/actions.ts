'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
})

export async function login(formData: FormData) {
  const result = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!result.success) redirect('/login?error=invalid')

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  })

  if (error) {
    console.error('Supabase login failed', { code: error.code })
    redirect('/login?error=credentials')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
