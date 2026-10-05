import { createClient } from "@/lib/supabase/server";

export interface SocialAccount {
  id: string;
  organization_id: string;
  platform: 'instagram' | 'facebook' | 'linkedin' | 'twitter' | 'other';
  account_id: string;
  account_name: string;
  status: string;
}

export interface PostContent {
  text: string;
  mediaUrls?: string[];
}

export class SocialService {
  /**
   * Retrieves all connected social accounts for the current user's organization.
   */
  static async getAccounts(): Promise<SocialAccount[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
      .from("profiles")
      .select("default_organization_id")
      .eq("id", user.id)
      .single();

    if (!profile?.default_organization_id) {
      throw new Error("No active organization found");
    }

    const { data: accounts, error } = await supabase
      .from("social_accounts")
      .select("id, organization_id, platform, account_id, account_name, status")
      .eq("organization_id", profile.default_organization_id)
      .eq("status", "active");

    if (error) {
      console.error("Error fetching social accounts:", error);
      throw error;
    }

    return accounts as SocialAccount[];
  }

  /**
   * Stub for refreshing tokens.
   */
  static async refreshToken(_accountId: string): Promise<boolean> {
    // In a real app, you would exchange the refresh_token for a new access_token
    // via the respective provider's API.
    return true;
  }

  /**
   * Standardized method to post content to a social platform.
   * This is currently a mock/stub that could integrate directly with Graph API, LinkedIn API, etc.
   * Alternatively, we delegate to n8n as built in Phase 07.
   */
  static async postContent(
    accountId: string, 
    content: PostContent
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    const supabase = await createClient();
    const { data: account, error } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("id", accountId)
      .single();

    if (error || !account) {
      return { success: false, error: "Account not found or access denied" };
    }

    // Example mock logic per platform
    try {
      if (account.platform === 'instagram') {
        console.log(`Posting to Instagram for account ${account.account_name}: ${content.text}`);
      } else if (account.platform === 'linkedin') {
        console.log(`Posting to LinkedIn for account ${account.account_name}: ${content.text}`);
      }
      
      // Assume success and return a mock URL
      return { success: true, url: `https://${account.platform}.com/post/mock-123` };
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
    }
  }

  /**
   * Securely saves a new connected social account.
   */
  static async connectAccount(payload: {
    platform: string;
    account_id: string;
    account_name: string;
    access_token: string;
  }): Promise<SocialAccount> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
      .from("profiles")
      .select("default_organization_id")
      .eq("id", user.id)
      .single();

    if (!profile?.default_organization_id) {
      throw new Error("No active organization found");
    }

    const { data: newAccount, error } = await supabase
      .from("social_accounts")
      .insert({
        organization_id: profile.default_organization_id,
        platform: payload.platform,
        account_id: payload.account_id,
        account_name: payload.account_name,
        access_token: payload.access_token,
        created_by: user.id
      })
      .select("id, organization_id, platform, account_id, account_name, status")
      .single();

    if (error) {
      throw error;
    }

    return newAccount as SocialAccount;
  }
}
