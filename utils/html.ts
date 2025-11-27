/**
 * HTML Utilities
 * Decode HTML entities và strip HTML tags
 */

/**
 * Decode HTML entities
 * Convert &agrave; → à, &aacute; → á, etc.
 */
export function decodeHTMLEntities(text: string): string {
  if (!text) return '';

  const entities: { [key: string]: string } = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    
    // Vietnamese characters
    '&agrave;': 'à',
    '&aacute;': 'á',
    '&acirc;': 'â',
    '&atilde;': 'ã',
    '&Agrave;': 'À',
    '&Aacute;': 'Á',
    '&Acirc;': 'Â',
    '&Atilde;': 'Ã',
    
    '&egrave;': 'è',
    '&eacute;': 'é',
    '&ecirc;': 'ê',
    '&Egrave;': 'È',
    '&Eacute;': 'É',
    '&Ecirc;': 'Ê',
    
    '&igrave;': 'ì',
    '&iacute;': 'í',
    '&Igrave;': 'Ì',
    '&Iacute;': 'Í',
    
    '&ograve;': 'ò',
    '&oacute;': 'ó',
    '&ocirc;': 'ô',
    '&otilde;': 'õ',
    '&Ograve;': 'Ò',
    '&Oacute;': 'Ó',
    '&Ocirc;': 'Ô',
    '&Otilde;': 'Õ',
    
    '&ugrave;': 'ù',
    '&uacute;': 'ú',
    '&Ugrave;': 'Ù',
    '&Uacute;': 'Ú',
    
    '&yacute;': 'ý',
    '&Yacute;': 'Ý',
    
    '&dstrok;': 'đ',
    '&Dstrok;': 'Đ',
    
    // Special characters
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&lsquo;': "'",
    '&rsquo;': "'",
    '&mdash;': '—',
    '&ndash;': '–',
    '&hellip;': '…',
    '&bull;': '•',
  };

  let decoded = text;

  // Replace known entities
  Object.keys(entities).forEach((entity) => {
    const regex = new RegExp(entity, 'g');
    decoded = decoded.replace(regex, entities[entity]);
  });

  // Replace numeric entities (&#123; or &#xAB;)
  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(dec);
  });

  decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  return decoded;
}

/**
 * Strip HTML tags
 * Remove all HTML tags from text
 */
export function stripHTMLTags(html: string): string {
  if (!html) return '';

  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

/**
 * Convert HTML to plain text
 * Decode entities and strip tags
 */
export function htmlToPlainText(html: string): string {
  if (!html) return '';

  // First decode entities
  let text = decodeHTMLEntities(html);
  
  // Then strip tags
  text = stripHTMLTags(text);
  
  return text;
}

/**
 * Format HTML for display
 * Convert HTML to readable plain text with line breaks
 */
export function formatHTMLForDisplay(html: string): string {
  if (!html) return '';

  let text = html;

  // Replace <br>, <br/>, <br /> with newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Replace </p> with double newlines
  text = text.replace(/<\/p>/gi, '\n\n');

  // Replace <li> with bullet points
  text = text.replace(/<li[^>]*>/gi, '\n• ');

  // Decode entities
  text = decodeHTMLEntities(text);

  // Strip remaining tags
  text = stripHTMLTags(text);

  // Clean up multiple newlines
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}
