import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"

const supabase = createClient("http://127.0.0.1:54321", process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRocW9scXh6Z3F5b2dxdmtpZnlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc2Njc0MTksImV4cCI6MjA0MzI0MzQxOX0.j5Q_wQ22jG52C-lQfQjQ0_QjQ_Q0_QjQ0_QjQ0_QjQ0")
async function main() {
    const { data: { session }, error: err } = await supabase.auth.signInWithPassword({
        email: "marcus@demarco.studio",
        password: "admin123"
    })
    const { data, error } = await supabase.from("profiles").select("id, full_name, email, avatar_url, job_title")
    console.log("Profiles:", data, error)
}
main()
