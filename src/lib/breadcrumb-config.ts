export const BREADCRUMB_DICTIONARY: Record<string, string> = {
  dashboard: 'Dashboard',
  assets: 'Asset Library',
  templates: 'AI Templates',
  designs: 'My Designs',
  studio: 'Creative Studio',
  settings: 'Pengaturan',
  members: 'Anggota Tim',
  brand: 'Kit Merek',
  new: 'Tambah Baru',
};

// UUID Regex to detect long IDs
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function formatBreadcrumbLabel(segment: string, overrides?: Record<string, string>): string {
  // 1. Check override
  if (overrides && overrides[segment]) {
    return overrides[segment];
  }
  
  // 2. Check dictionary
  const lowerSegment = segment.toLowerCase();
  if (BREADCRUMB_DICTIONARY[lowerSegment]) {
    return BREADCRUMB_DICTIONARY[lowerSegment];
  }
  
  // 3. Truncate UUID or very long IDs
  if (UUID_REGEX.test(segment) || segment.length > 20) {
    return segment.substring(0, 8) + '...';
  }
  
  // 4. Default Title Case
  return segment
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
