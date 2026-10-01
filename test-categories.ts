import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('template_categories').select('*')
  console.log("Select Data:", data)
  console.log("Select Error:", error)
  
  if (data && data.length === 0) {
    const defaults = [
      { name: "Social Media", slug: "social-media", template_type: "social_post", is_system: true, organization_id: "00000000-0000-0000-0000-000000000000" } // dummy org for testing schema
    ]
    const { error: insertError } = await supabase.from('template_categories').insert(defaults)
    console.log("Insert Error:", insertError)
  }
}

test()
