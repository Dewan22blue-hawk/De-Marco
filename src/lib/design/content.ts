export function parseElementContent(value: unknown): Record<string, any> {
  if (value === null || value === undefined) {
    return {};
  }
  
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
      return { text: String(parsed) };
    } catch {
      return { text: value };
    }
  }
  
  if (typeof value === 'object') {
    return value as Record<string, any>;
  }
  
  return { text: String(value) };
}
