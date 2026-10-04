import { createClient } from "@/lib/supabase/server";
import { GeminiProvider } from "./gemini-provider";
import { AITaskType, AIContext } from "./types";
import { createAuditLog } from "@/lib/audit";

export async function runAITask(opts: {
  organization_id: string;
  task_type: AITaskType;
  prompt: string;
  context?: AIContext;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get AI provider credentials (for now, assume process.env.GEMINI_API_KEY)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("AI provider configuration missing");

  const provider = new GeminiProvider(apiKey);

  // Compile system prompt based on brand kit
  let systemPrompt = "You are an expert marketing copywriter and strategist.";
  if (opts.context?.brand) {
    systemPrompt += `
Brand Context:
- Name: ${opts.context.brand.name}
- Tagline: ${opts.context.brand.tagline || 'N/A'}
- Description: ${opts.context.brand.description || 'N/A'}
- Tone of Voice: ${opts.context.brand.tone_of_voice?.join(', ') || 'Professional'}
- Forbidden Words: ${opts.context.brand.forbidden_words?.join(', ') || 'None'}
- Preferred CTA: ${opts.context.brand.preferred_cta || 'N/A'}
`;
  }

  // Execute AI Request
  const response = await provider.generateText({
    prompt: opts.prompt,
    systemPrompt: systemPrompt,
    temperature: 0.7,
  });

  // Log to ai_runs
  const { data: run, error: runError } = await supabase
    .from("ai_runs")
    .insert({
      organization_id: opts.organization_id,
      task_type: opts.task_type,
      input_context: { prompt: opts.prompt, context: opts.context },
      output: response,
      created_by: user.id,
    })
    .select()
    .single();

  if (runError) {
    console.error("Failed to log AI run:", runError);
  } else {
    // Create Audit Log for AI execution
    await createAuditLog({
      organization_id: opts.organization_id,
      table_name: "ai_runs",
      record_id: run.id,
      action: "create",
      new_data: { task_type: opts.task_type }
    });
  }

  return response.text;
}

export async function resolveTemplateVariablesWithAI(opts: {
  organization_id: string;
  template: any;
  brandKit?: any;
  assets?: any[];
  context?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("AI provider configuration missing");

  const provider = new GeminiProvider(apiKey);

  const variables = opts.template.template_variables || [];
  if (variables.length === 0) return {};

  let systemPrompt = "You are an expert marketing copywriter and design strategist.\n";
  systemPrompt += "Your task is to map values to template variables based on the user's brief.\n";
  
  if (opts.brandKit) {
    systemPrompt += `
Brand Guidelines:
- Name: ${opts.brandKit.name}
- Tagline: ${opts.brandKit.tagline || 'N/A'}
- Tone of Voice: ${opts.brandKit.tone_of_voice?.join(', ') || 'Professional'}
- Forbidden Words: ${opts.brandKit.forbidden_words?.join(', ') || 'None'}
`;
  }

  if (opts.assets && opts.assets.length > 0) {
    systemPrompt += "\nAvailable Asset IDs (for image variables):\n";
    opts.assets.forEach(a => {
      systemPrompt += `- ${a.id} (Tags: ${a.tags?.join(', ') || 'none'}, Desc: ${a.description || 'none'})\n`;
    });
  }

  systemPrompt += `
Template Variables:
${JSON.stringify(variables.map((v: any) => ({
  id: v.id,
  name: v.name,
  type: v.variable_type,
  placeholder: v.placeholder
})), null, 2)}

Return ONLY a valid JSON object mapping variable IDs to their generated values (strings). Do not include markdown formatting or backticks around the JSON.`;

  const response = await provider.generateText({
    prompt: opts.context || "Generate suitable content for these variables.",
    systemPrompt: systemPrompt,
    temperature: 0.7,
  });

  // Log to ai_runs
  const { data: run, error: runError } = await supabase
    .from("ai_runs")
    .insert({
      organization_id: opts.organization_id,
      task_type: "design_suggestion",
      input_context: { context: opts.context, templateId: opts.template.id },
      output: response,
      created_by: user.id,
    })
    .select()
    .single();

  if (!runError) {
    await createAuditLog({
      organization_id: opts.organization_id,
      table_name: "ai_runs",
      record_id: run.id,
      action: "create",
      new_data: { task_type: "design_suggestion" }
    });
  }

  try {
    const rawText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(rawText);
  } catch (e) {
    console.error("Failed to parse AI variable values:", e);
    return {};
  }
}

