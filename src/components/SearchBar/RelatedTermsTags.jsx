/**
 * RelatedTermsTags Component
 * Displays related terms as green clickable tags
 * Adapted from NeurosynthSearch RelatedTermsList & RelatedTermsPanel
 */
import React from 'react';
import styles from './SearchBar.module.css';

export function RelatedTermsTags({
  terms = [],
  onTermClick,
  loading = false,
  maxTags = 10,
}) {
  if (terms.length === 0 && !loading) {
    return null;
  }

  // Limit to top terms
  const displayTerms = terms.slice(0, maxTags);

  return (
    <div className={styles.relatedTagsContainer}>
      <div className={styles.relatedTagsLabel}>
        {loading ? '⏳ Related terms...' : 'Related terms:'}
      </div>
      <div className={styles.relatedTags}>
        {displayTerms.map((item) => (
          <button
            key={item.term}
            className={styles.relatedTag}
            onClick={() => onTermClick?.(item.term)}
            disabled={loading}
            title={`co_count: ${item.co_count}, jaccard: ${item.jaccard?.toFixed(4) || 'N/A'}`}
          >
            {item.term}
            <span className={styles.tagScore}>{Math.round(item.co_count || 0)}</span>
          </button>
        ))}
        {loading && (
          <div style={{ 
            fontSize: '0.9rem', 
            color: 'var(--text-secondary)',
            alignSelf: 'center',
            marginLeft: '0.5rem'
          }}>
            loading...
          </div>
        )}
      </div>
    </div>
  );
}
