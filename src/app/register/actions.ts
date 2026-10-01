'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const signupSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
})

export async function signup(formData: FormData) {
  const result = signupSchema.safeParse({
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!result.success) redirect('/register?error=invalid')

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: { data: { full_name: result.data.full_name } },
  })

  if (error) redirect('/register?error=signup')

  redirect('/login?message=registered')
}