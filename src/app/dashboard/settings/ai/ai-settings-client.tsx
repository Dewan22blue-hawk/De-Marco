'use client'

import { useState } from 'react';
import { saveAiSettings } from './actions';
import { useRouter } from 'next/navigation';
import { KeyRound, Sparkles, CheckCircle2, Lock } from 'lucide-react';

type AISettingsClientProps = {
  hasGeminiKey: boolean;
  isOwnerOrAdmin: boolean;
};

export function AISettingsClient({ hasGeminiKey, isOwnerOrAdmin }: AISettingsClientProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await saveAiSettings(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        router.refresh();
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex flex-col gap-2">
        <h2 className="text-display-sm font-bold text-on-surface flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-primary" />
          AI Integration
        </h2>
        <p className="text-body-lg text-on-surface-variant">
          Manage your organization's AI API keys. These keys are encrypted at rest and never exposed to the client.
        </p>
      </div>

      <div className="bg-surface-container-low rounded-[2rem] border border-outline-variant/30 overflow-hidden shadow-sm">
        <div className="p-6 md:p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-title-lg font-semibold flex items-center gap-2 text-on-surface">
              Google Gemini API
            </h3>
            <p className="text-body-md text-on-surface-variant">
              Used for the Hybrid AI Design engine and marketing copy generation.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {hasGeminiKey && (
              <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Key Configured</span>
                  <span className="text-xs opacity-90">API key is securely stored in the vault.</span>
                </div>
              </div>
            )}

            {!isOwnerOrAdmin ? (
              <div className="flex items-center gap-3 p-4 bg-surface-container rounded-xl text-on-surface-variant">
                <Lock className="w-5 h-5 shrink-0" />
                <p className="text-sm">Only Organization Owners and Admins can configure AI settings.</p>
              </div>
            ) : (
              <form action={handleSubmit} className="flex flex-col gap-4">
                <input type="hidden" name="provider" value="gemini" />
                
                <div className="flex flex-col gap-2">
                  <label htmlFor="apiKey" className="text-label-md font-medium text-on-surface">
                    {hasGeminiKey ? 'Update API Key' : 'API Key'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <input
                      id="apiKey"
                      name="apiKey"
                      type="password"
                      placeholder={hasGeminiKey ? "••••••••••••••••••••••••" : "AIzaSy..."}
                      required
                      className="w-full bg-surface-container pl-11 pr-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface placeholder:text-on-surface-variant/50"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-error font-medium bg-error-container text-on-error-container p-3 rounded-lg">
                    {error}
                  </p>
                )}

                {success && (
                  <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg">
                    Settings saved successfully.
                  </p>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="clay-button-primary px-6 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2"
                  >
                    {isPending ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0"></span>
                        Saving...
                      </>
                    ) : (
                      hasGeminiKey ? 'Update Key' : 'Save Key'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
