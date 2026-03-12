export type AspectDimensions = {
  aspectRatio?: number;
  width?: number;
  height?: number;
};

/**
 * Convert Sanity-style image/video dimensions into a CSS padding-top percentage
 * so media can preserve its intrinsic aspect ratio.
 *
 * - Prefer `aspectRatio` (width / height) when available
 * - Fallback to `width` / `height`
 */
export function getAspectPadding(
  dimensions?: AspectDimensions | null
): string | undefined {
  if (!dimensions) return undefined;

  const { aspectRatio, width, height } = dimensions;

  if (typeof aspectRatio === "number" && aspectRatio > 0) {
    // Sanity stores aspectRatio as width / height
    const pct = (1 / aspectRatio) * 100;
    return `${pct}%`;
  }

  if (
    typeof width === "number" &&
    typeof height === "number" &&
    width > 0 &&
    height > 0
  ) {
    const pct = (height / width) * 100;
    return `${pct}%`;
  }

  return undefined;
}

export default getAspectPadding;


