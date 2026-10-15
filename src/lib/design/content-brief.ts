export const DESIGN_BRIEF_STORAGE_KEY = "generated_design_content"

export interface ContentBrief {
  title?: string | null
  body?: string | null
  hashtags?: string | string[] | null
  cta?: string | null
  content_type?: string | null
  platform?: string | null
  campaign_id?: string | null
  content_id?: string | null
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  website: "a website/blog",
}

function normalizeHashtags(hashtags: ContentBrief["hashtags"]): string[] {
  if (!hashtags) return []
  if (Array.isArray(hashtags)) return hashtags.filter(Boolean)
  return hashtags.split(/\s+/).filter(Boolean)
}

function truncate(value: string, max: number): string {
  const trimmed = value.trim()
  return trimmed.length > max ? `${trimmed.slice(0, max).trimEnd()}…` : trimmed
}

export function buildDesignPromptFromContent(brief: ContentBrief): string {
  const platform = brief.platform
    ? PLATFORM_LABELS[brief.platform.toLowerCase()] || brief.platform
    : "social media"
  const contentType = brief.content_type
    ? brief.content_type.replace(/_/g, " ")
    : "social post"

  const parts: string[] = [`Create a ${contentType} visual for ${platform}.`]

  if (brief.title?.trim()) {
    parts.push(`Headline: "${truncate(brief.title, 120)}".`)
  }
  if (brief.body?.trim()) {
    parts.push(`Key message: "${truncate(brief.body, 280)}".`)
  }
  const hashtags = normalizeHashtags(brief.hashtags)
  if (hashtags.length > 0) {
    parts.push(`Include tags: ${hashtags.slice(0, 8).join(" ")}.`)
  }
  if (brief.cta?.trim()) {
    parts.push(`Call to action: "${truncate(brief.cta, 80)}".`)
  }

  return parts.join(" ")
}

export function dimensionForContent(brief: ContentBrief): string {
  const contentType = (brief.content_type || "").toLowerCase()
  const platform = (brief.platform || "").toLowerCase()

  if (contentType === "story" || contentType === "reel") return "1080x1920"
  if (contentType === "article" || contentType === "announcement") return "1200x628"
  if (platform === "linkedin") return "1200x628"
  return "1080x1080"
}

export function storeDesignBrief(brief: ContentBrief): void {
  try {
    sessionStorage.setItem(DESIGN_BRIEF_STORAGE_KEY, JSON.stringify(brief))
  } catch (error) {
    console.error("Failed to store design brief:", error)
  }
}

export function readDesignBrief(): ContentBrief | null {
  try {
    const raw = sessionStorage.getItem(DESIGN_BRIEF_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ContentBrief
  } catch (error) {
    console.error("Failed to read design brief:", error)
    return null
  }
}

export function clearDesignBrief(): void {
  try {
    sessionStorage.removeItem(DESIGN_BRIEF_STORAGE_KEY)
  } catch (error) {
    console.error("Failed to clear design brief:", error)
  }
}
