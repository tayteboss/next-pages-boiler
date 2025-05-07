// ./sanityImageLoader.js
// Or, if using TypeScript: ./sanityImageLoader.ts

// IMPORTANT: Replace these with your actual Sanity project ID and dataset
// You can find these in your Sanity project management console (sanity.io/manage)
const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = "production";

/**
 * Sanity Image Loader for Next.js Image component.
 * @param {{ src: string, width: number, quality?: number }} params
 * @returns {string} The complete Sanity image URL with transformation parameters.
 */
export default function sanityImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // The `src` from Sanity already contains the base URL, project ID, dataset, and asset info.
  // Example src: https://cdn.sanity.io/images/e1i1kimz/production/d357bf4ab55b88c1cb7dc3c980d18c9349533d82-2944x1776.jpg
  const url = new URL(src);

  // Ensure it's a cdn.sanity.io URL, though remotePatterns in next.config.js should also enforce this.
  if (url.hostname !== "cdn.sanity.io") {
    // Not a Sanity CDN image, return the original src or handle as an error
    // For safety, returning original src, but ideally, this loader should only process Sanity images.
    console.warn(`Sanity Image Loader received a non-Sanity CDN URL: ${src}`);
    return src;
  }

  // Apply transformations
  url.searchParams.set("auto", "format"); // Automatically select best format (WebP, AVIF)
  url.searchParams.set("fit", "max"); // Ensure image fits within dimensions, don't upscale
  url.searchParams.set("w", width.toString());

  if (quality) {
    url.searchParams.set("q", quality.toString());
  }

  // Add other desired default parameters here, for example:
  // url.searchParams.set('crop', 'entropy'); // if you want entropy cropping by default

  return url.toString();
}
