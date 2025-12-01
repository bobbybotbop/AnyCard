import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { BACKEND_BASE_PATH } from "../src/constants/Navigation"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Proxies an image URL through the backend to bypass hotlinking protection.
 * Only proxies external URLs (http/https), leaves relative URLs and data URLs unchanged.
 * 
 * @param imageUrl - The image URL to potentially proxy
 * @returns The proxied URL if external, or the original URL if relative/data URL
 */
export function proxyImageUrl(imageUrl: string | undefined | null): string {
  if (!imageUrl) {
    return "/ImageNotFound.jpg";
  }

  // Don't proxy relative URLs or data URLs
  if (imageUrl.startsWith("/") || imageUrl.startsWith("data:") || imageUrl.startsWith("blob:")) {
    return imageUrl;
  }

  // Check if it's an external URL (http or https)
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return `${BACKEND_BASE_PATH}/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
  }

  // Return as-is for any other format
  return imageUrl;
}
