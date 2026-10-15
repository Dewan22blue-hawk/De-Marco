import { AIProvider, AIRequest, AIResponse } from "./types";

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";

export class GeminiProvider implements AIProvider {
  name = "gemini";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${this.apiKey}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: (request.systemPrompt ? request.systemPrompt + "\n\n" : "") + request.prompt }]
          }
        ],
        generationConfig: {
          temperature: request.temperature ?? 0.7,
          maxOutputTokens: request.maxTokens,
          thinkingConfig: { thinkingLevel: "minimal" },
          ...(request.jsonMode ? { responseMimeType: "application/json" } : {}),
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Gemini API Error");
    }

    const data = await response.json();
    const parts = (data.candidates?.[0]?.content?.parts ?? []) as Array<{ thought?: boolean; text?: string }>;
    const text = parts.map((p) => p.thought ? "" : p.text ?? "").join("").trim();
    const u = data.usageMetadata;

    return {
      text,
      raw: data,
      usage: {
        promptTokens: u?.promptTokenCount ?? 0,
        completionTokens: u?.candidatesTokenCount ?? 0,
        totalTokens: u?.totalTokenCount ?? 0,
      },
    };
  }
}
