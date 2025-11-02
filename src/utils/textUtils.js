/**
 * Text Utility Functions
 */

/**
 * Highlight prefix in text with HTML
 * @param {string} text - The text to highlight in
 * @param {string} prefix - The prefix to highlight
 * @returns {string} HTML string with highlighted prefix
 */
export function highlightPrefix(text, prefix) {
  if (!prefix) return text;
  const regex = new RegExp(`^(${prefix})`, 'i');
  return text.replace(regex, '<strong>$1</strong>');
}

/**
 * Copy text to clipboard with fallback
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Whether copy was successful
 */
export async function copyToClipboard(text) {
  try {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback: execCommand
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (err) {
    console.error('Copy failed:', err);
    return false;
  }
}

/**
 * Sort results by year or title
 * @param {Array} results - Array of result objects
 * @param {string} sortBy - Sort method ('year' or 'title')
 * @returns {Array} Sorted results
 */
export function sortResults(results, sortBy = 'year') {
  if (sortBy === 'year') {
    // Sort by year (descending), then by title (ascending)
    return results.sort((a, b) => {
      if (b.year !== a.year) {
        return b.year - a.year;
      }
      return a.title.localeCompare(b.title);
    });
  } else if (sortBy === 'title') {
    // Sort by title (ascending)
    return results.sort((a, b) => a.title.localeCompare(b.title));
  }
  return results;
}

/**
 * Sort related terms by co_count or jaccard
 * @param {Array} related - Array of related term objects
 * @param {string} sortBy - Sort method ('co_count' or 'jaccard')
 * @returns {Array} Sorted related terms
 */
export function sortRelatedTerms(related, sortBy = 'co_count') {
  if (sortBy === 'co_count') {
    return [...related].sort((a, b) => b.co_count - a.co_count);
  } else if (sortBy === 'jaccard') {
    return [...related].sort((a, b) => b.jaccard - a.jaccard);
  }
  return related;
}

/**
 * Calculate rankings for related terms
 * @param {Array} related - Array of related term objects
 * @param {string} method - Ranking method ('co_count' or 'jaccard')
 * @returns {Map} Map of term -> rank
 */
export function calculateRankings(related, method = 'co_count') {
  const sorted = sortRelatedTerms(related, method);
  const ranks = new Map();
  sorted.forEach((item, idx) => {
    ranks.set(item.term, idx + 1);
  });
  return ranks;
}
