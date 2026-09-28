'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  let full_name = formData.get('full_name') as string
  
  if (!full_name) {
    full_name = email.split('@')[0]
  }

  // Step 1: Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: full_name
      }
    }
  })

  // Handling failed signup
  if (authError) {
    redirect(`/register?error=${encodeURIComponent(authError.message)}`)
  }

  if (authData.user) {
    try {
      // Admin client to bypass RLS for initial onboarding items
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // Step 2: Auto-create a personal organization for the user so they can access the Dashboard
      const orgName = `${full_name.split(' ')[0]}'s Org` // Ex: John's Org
      const orgSlug = `org-${authData.user.id.substring(0, 8)}`

      const { data: orgData, error: orgError } = await supabaseAdmin
        .from('organizations')
        .insert({
          name: orgName,
          slug: orgSlug,
          created_by: authData.user.id
        })
        .select('id')
        .single()

      if (orgError) {
        throw new Error(`Failed to create org: ${orgError.message}`)
      }

      // Step 3: Insert user profile mapped to this organization
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: email,
          full_name: full_name,
          default_organization_id: orgData.id
        })

      if (profileError) {
        throw new Error(`Failed to create profile: ${profileError.message}`)
      }

      // Step 4: Give user the 'admin' or 'owner' role within this organization
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from('roles')
        .insert({
          organization_id: orgData.id,
          name: 'owner',
          display_name: 'Owner',
          is_system: true
        })
        .select('id')
        .single()

      if (roleError) {
          throw new Error(`Failed to create role: ${roleError.message}`)
      }
        
      if (roleData) {
        // Tie User to Organization via organization_members
        await supabaseAdmin
          .from('organization_members')
          .insert({
            organization_id: orgData.id,
            user_id: authData.user.id,
            role_id: roleData.id,
            status: 'active'
          })
      }

    } catch (e: any) {
      console.error("Onboarding setup failed: ", e)
    }
  }

  // Step 5: Redirect to Dashboard once auth succeeds
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
