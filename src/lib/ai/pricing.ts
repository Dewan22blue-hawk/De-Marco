/**
 * Estimated pricing rates for Google Gemini models.
 * NOTE: These are APPROXIMATE rates (USD per 1,000,000 tokens) for gemini-1.5-flash.
 * Actual billing may vary and pricing is subject to change by Google.
 */

export const GEMINI_15_FLASH_INPUT_COST_PER_1M = 0.075;
export const GEMINI_15_FLASH_OUTPUT_COST_PER_1M = 0.30;

/**
 * Calculates estimated cost in USD based on input and output token counts.
 * 
 * @param inputTokens Number of prompt/input tokens
 * @param outputTokens Number of completion/candidate tokens
 * @returns Estimated cost in USD
 */
export function estimateCostUsd(inputTokens: number = 0, outputTokens: number = 0): number {
  const inputCost = (Math.max(0, inputTokens) / 1_000_000) * GEMINI_15_FLASH_INPUT_COST_PER_1M;
  const outputCost = (Math.max(0, outputTokens) / 1_000_000) * GEMINI_15_FLASH_OUTPUT_COST_PER_1M;
  return Number((inputCost + outputCost).toFixed(6));
}
