const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('http://127.0.0.1:54321', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0');

async function test() {
  console.log('Testing admin@demarco.studio...');
  const res1 = await supabase.auth.signInWithPassword({
    email: 'admin@demarco.studio',
    password: 'password123'
  });
  console.log("Admin Login:", res1.error ? res1.error.message : "Success!");

  console.log('Testing marcus@demarco.studio...');
  const res2 = await supabase.auth.signInWithPassword({
    email: 'marcus@demarco.studio',
    password: 'admin123'
  });
  console.log("Marcus Login:", res2.error ? res2.error.message : "Success!");
}
test();
