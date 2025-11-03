/**
 * RelatedTermsTags Component
 * Renders only the list of related term tags or a loading indicator.
 */
import React from 'react';
import styles from './SearchBar.module.css';

export function RelatedTermsTags({
  terms = [],
  onTermClick,
  loading = false,
  maxTags = 10,
}) {
  // This component now only renders the tags themselves, or a loading message.
  // The container and label are handled by the parent (SearchContainer).

  if (terms.length === 0 && !loading) {
    return null;
  }

  const displayTerms = terms.slice(0, maxTags);

  return (
    <>
      {displayTerms.map((item) => (
                  <button
                    key={item.term}
                    className={styles.relatedTag}
                    onClick={() => onTermClick?.(item.term)}
                    disabled={loading}
                    data-tooltip={`co-occurrence: ${item.co_count}, jaccard: ${item.jaccard?.toFixed(4) || 'N/A'}`}
                  >
                    {item.term}
                  </button>      ))}
      {loading && (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          loading...
        </div>
      )}
    </>
  );
}
