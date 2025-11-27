/**
 * Image Utilities
 * Extract images from HTML
 */

/**
 * Extract image URLs from HTML
 * Find all <img> tags and extract src attributes
 */
export function extractImagesFromHTML(html: string): string[] {
  if (!html) return [];

  const images: string[] = [];
  
  // Regex to match <img> tags and extract src
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    if (src && src.startsWith('http')) {
      images.push(src);
    }
  }
  
  return images;
}

/**
 * Remove image tags from HTML
 * Strip all <img> tags but keep other content
 */
export function removeImagesFromHTML(html: string): string {
  if (!html) return '';
  
  return html.replace(/<img[^>]*>/gi, '');
}
