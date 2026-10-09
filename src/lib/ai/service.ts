import { createClient } from "@/lib/supabase/server";
import { GeminiProvider } from "./gemini-provider";
import { AITaskType, AIContext, AIDesignRequest } from "./types";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";
import { DesignOutputSchema, DesignOutput } from "@/schemas/ai-content";

export async function runAITask<T = any>(opts: {
  organization_id: string;
  task_type: AITaskType;
  prompt: string;
  context?: AIContext;
  schema?: z.ZodSchema<T>;
}): Promise<T> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("AI provider configuration missing");

  const provider = new GeminiProvider(apiKey);

  // Fetch Brand Kit if not provided in context
  let brand = opts.context?.brand;
  if (!brand) {
    const { data: fetchedBrand } = await supabase
      .from("brands")
      .select("*")
      .eq("organization_id", opts.organization_id)
      .eq("is_default", true)
      .maybeSingle();
    
    if (fetchedBrand) {
      brand = fetchedBrand;
    }
  }

  let systemPrompt = "You are an expert marketing copywriter and strategist.\n";
  if (brand) {
    systemPrompt += `
Brand Context:
Name: ${brand.name}
Tagline: ${brand.tagline || 'N/A'}
Description: ${brand.description || 'N/A'}
Tone: ${brand.tone_of_voice?.join(', ') || 'Professional'}
Forbidden words: ${brand.forbidden_words?.join(', ') || 'None'}
Preferred CTA: ${brand.preferred_cta || 'N/A'}
`;
  }

  systemPrompt += `
Strict Constraints & Anti-Hallucination Rules:
- DO NOT invent or hallucinate any prices, discounts, promotions, or factual claims unless explicitly provided in the context.
- Adhere strictly to the Brand Context and tone of voice.
`;

  if (opts.schema) {
    systemPrompt += `\nYou must return ONLY a valid JSON object matching the requested schema. Do not include markdown formatting, backticks, or any conversational text.`;
  }

  const response = await provider.generateText({
    prompt: opts.prompt,
    systemPrompt,
    temperature: 0.7,
  });

  const text = response.text;

  // Log to ai_runs
  const { data: run, error: runError } = await supabase
    .from("ai_runs")
    .insert({
      organization_id: opts.organization_id,
      task_type: opts.task_type,
      input_context: { prompt: opts.prompt, context: opts.context },
      output: text,
      created_by: user.id,
    })
    .select()
    .single();

  if (runError) {
    console.error("Failed to log AI run:", runError);
  } else if (run) {
    // Create Audit Log for AI execution
    await createAuditLog({
      organization_id: opts.organization_id,
      table_name: "ai_runs",
      record_id: run.id,
      action: "create",
      new_data: { task_type: opts.task_type }
    });
  }

  if (opts.schema) {
    try {
      const rawText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(rawText);
      const validated = opts.schema.safeParse(parsed);
      if (!validated.success) throw new Error("Invalid AI output");
      return validated.data as T;
    } catch (e) {
      console.error("AI Output Validation Failed:", e);
      throw new Error("AI returned invalid data format");
    }
  }

  return text as unknown as T;
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

export async function generateHybridDesign(opts: {
  organization_id: string;
  request: AIDesignRequest;
}): Promise<DesignOutput> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  let assets = opts.request.assets;
  if (!assets) {
    const { data: fetchedAssets } = await supabase
      .from("assets")
      .select("id, name, asset_type, tags, description")
      .eq("organization_id", opts.organization_id)
      .eq("status", "active")
      .limit(50);
    assets = fetchedAssets || [];
  }

  let template = null;
  if (opts.request.templateId) {
    const { data: fetchedTemplate } = await supabase
      .from("templates")
      .select("*")
      .eq("id", opts.request.templateId)
      .single();
    template = fetchedTemplate;
  }

  const fullPrompt = opts.request.prompt;
  let taskInstruction = "";

  if (template) {
    taskInstruction = `You are an expert graphic designer and template engine. Fill these template variables and adjust the layout based on the user's brief.
Template Name: ${template.name}
Template Dimensions: ${template.width}x${template.height} ${template.unit}
Template Elements: ${JSON.stringify(template.elements)}
Template Variables: ${JSON.stringify(template.template_variables)}
Instructions: Return a complete updated DesignOutput matching the requested schema. Map the user's content and assets to the appropriate template variables, preserving IDs where applicable.`;
  } else {
    taskInstruction = `You are an expert graphic designer. Create a complete, beautiful design layout from scratch based on the user brief.
Requested Dimensions: ${opts.request.dimension?.width || 1080}x${opts.request.dimension?.height || 1080} px.
Instructions: Return a complete DesignOutput matching the requested schema with all elements appropriately positioned, sized, and styled.`;
  }

  if (assets && assets.length > 0) {
    taskInstruction += `\n\nAvailable Asset IDs for image/logo usage:\n`;
    taskInstruction += assets.map((a: any) => `- ${a.id} (${a.asset_type}): ${a.name} [Tags: ${a.tags?.join(', ') || 'N/A'}]`).join('\n');
  }

  const promptToSend = `${taskInstruction}\n\nUser Brief: ${fullPrompt}`;

  return runAITask<DesignOutput>({
    organization_id: opts.organization_id,
    task_type: "design_suggestion",
    prompt: promptToSend,
    context: {
      assets,
      template,
      brand: opts.request.brandContext
    },
    schema: DesignOutputSchema,
  });
}

