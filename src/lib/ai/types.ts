export type AITaskType = 'content_generation' | 'design_suggestion' | 'analysis' | 'strategy';

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
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

export interface AssetContext {
  id: string;
  name: string;
  asset_type: string;
  tags?: string[];
  description?: string;
}

export interface AIDesignRequest {
  prompt: string;
  dimension?: { width: number; height: number };
  templateId?: string;
  campaignId?: string;
  assets?: AssetContext[];
  brandContext?: any;
}
