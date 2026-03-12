export function ratioToPadding(ratio?: string): string | undefined {
  if (!ratio || typeof ratio !== "string") return undefined;
  // Accept formats like "16:9", "16-9", "1:1", "3-4", with optional spaces
  const cleaned = ratio.trim();
  const parts = cleaned.split(/[^0-9.]+/).filter(Boolean);
  if (parts.length !== 2) return undefined;
  const width = parseFloat(parts[0]);
  const height = parseFloat(parts[1]);
  if (!isFinite(width) || !isFinite(height) || width <= 0 || height <= 0) {
    return undefined;
  }
  const pct = (height / width) * 100;
  return `${pct}%`;
}

export default ratioToPadding;

