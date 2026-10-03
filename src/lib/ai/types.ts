export type AITaskType = 'content_generation' | 'design_suggestion' | 'analysis' | 'strategy';

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  text: string;
  raw?: any;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIProvider {
  name: string;
  generateText(request: AIRequest): Promise<AIResponse>;
}

export interface AIContext {
  brand?: any;
  assets?: any[];
  template?: any;
  campaign?: any;
  userGoal?: string;
}
