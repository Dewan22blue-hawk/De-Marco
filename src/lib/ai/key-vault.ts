import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

const ALGORITHM = 'aes-256-gcm';

function getEncryptionSecret(): Buffer {
  const secret = process.env.AI_KEY_ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error('AI_KEY_ENCRYPTION_SECRET is not set');
  }
  // If the secret is exactly 32 bytes (64 hex characters or 32 ascii chars),
  // we use it directly. Otherwise, we hash it to get exactly 32 bytes.
  if (Buffer.from(secret).length === 32) {
    return Buffer.from(secret);
  }
  return crypto.createHash('sha256').update(secret).digest();
}

export function encryptApiKey(plain: string): string {
  const secret = getEncryptionSecret();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, secret, iv);
  
  let encrypted = cipher.update(plain, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptApiKey(cipherText: string): string {
  const parts = cipherText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted string format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encryptedText = parts[2];
  
  const secret = getEncryptionSecret();
  const decipher = crypto.createDecipheriv(ALGORITHM, secret, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export async function getOrgApiKey(organization_id: string, provider: string = 'gemini'): Promise<string | null> {
  const supabase = await createClient();
  
  // Try to get from database
  const { data, error } = await supabase
    .from('ai_settings')
    .select('api_key_encrypted')
    .eq('organization_id', organization_id)
    .eq('provider', provider)
    .maybeSingle();

  if (!error && data?.api_key_encrypted) {
    try {
      return decryptApiKey(data.api_key_encrypted);
    } catch (e) {
      console.error(`Failed to decrypt API key for organization ${organization_id}:`, e);
      // Fallback to env if decrypt fails
    }
  }

  // Fallback to environment variables
  if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  
  return null;
}

export async function setOrgApiKey(organization_id: string, provider: string, plainKey: string): Promise<void> {
  const supabase = await createClient();
  const encryptedKey = encryptApiKey(plainKey);

  const { error } = await supabase
    .from('ai_settings')
    .upsert({
      organization_id,
      provider,
      api_key_encrypted: encryptedKey,
    }, {
      onConflict: 'organization_id, provider'
    });

  if (error) {
    console.error(`Failed to save API key for organization ${organization_id}:`, error);
    throw new Error('Failed to save AI configuration');
  }
}
