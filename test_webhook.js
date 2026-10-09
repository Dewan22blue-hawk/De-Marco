require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Test Scenario A: Success
  const { data: events } = await supabase.from('content_calendar').select('*').limit(1);
  if (!events || events.length === 0) {
    console.log("No events found to test");
    return;
  }
  const event = events[0];
  console.log("Testing Event:", event.id);
  
  const res = await fetch('http://localhost:3000/api/webhooks/n8n/publish', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.N8N_WEBHOOK_SECRET,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      eventId: event.id,
      contentId: event.content_id,
      organizationId: event.organization_id,
      status: 'failed',
      error_note: 'OAuth Error (Token Expired)',
      is_mock: false
    })
  });
  
  const json = await res.json();
  console.log("Result Scenario B (Failed):", json);
}

run();
