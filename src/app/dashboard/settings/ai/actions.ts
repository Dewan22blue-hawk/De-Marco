'use server'

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { setOrgApiKey } from '@/lib/ai/key-vault';
import { hasPermission, getCurrentUserContext } from '@/lib/auth/authorization';
import { createAuditLog } from '@/lib/audit';

const AiSettingsSchema = z.object({
  provider: z.enum(['gemini']),
  apiKey: z.string().min(1, 'API Key cannot be empty'),
});

export async function saveAiSettings(formData: FormData) {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { error: 'Unauthorized' };
    }

    const isAllowed = await hasPermission('organizations.update');
    if (!isAllowed) {
      return { error: 'Forbidden: Insufficient permissions' };
    }

    const provider = formData.get('provider') as string;
    const apiKey = formData.get('apiKey') as string;

    const validated = AiSettingsSchema.safeParse({ provider, apiKey });
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    await setOrgApiKey(context.organization.id, validated.data.provider, validated.data.apiKey);

    // Masked log
    const maskedKey = '******' + validated.data.apiKey.slice(-4);
    
    // Create Audit Log
    await createAuditLog({
      organization_id: context.organization.id,
      table_name: 'ai_settings',
      record_id: `${context.organization.id}-${validated.data.provider}`,
      action: 'update',
      new_data: { provider: validated.data.provider, api_key_masked: maskedKey },
    });

    revalidatePath('/dashboard/settings/ai');
    return { success: true };
  } catch (error: any) {
    console.error('Error saving AI settings:', error);
    return { error: error.message || 'Failed to save AI settings' };
  }
}
