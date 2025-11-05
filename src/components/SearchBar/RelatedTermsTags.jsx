/**
 * RelatedTermsTags Component
 * Renders only the list of related term tags or a loading indicator.
 */
import React, { useRef, useEffect } from 'react';
import styles from './SearchBar.module.css';

export function RelatedTermsTags({
  terms = [],
  onTermClick,
  loading = false,
  maxTags = 10,
  onMouseEnter,
  focusedIndex = -1,
  onKeyDown,
}) {
  // This component now only renders the tags themselves, or a loading message.
  // The container and label are handled by the parent (SearchContainer).
  const buttonRefs = useRef([]);

  // When focused index changes, focus the corresponding button
  useEffect(() => {
    if (focusedIndex >= 0 && focusedIndex < buttonRefs.current.length) {
      buttonRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  if (terms.length === 0 && !loading) {
    return null;
  }

  const displayTerms = terms.slice(0, maxTags);

  return (
    <>
      {displayTerms.map((item, index) => (
                  <button
                    key={item.term}
                    ref={(el) => { buttonRefs.current[index] = el; }}
                    className={`${styles.relatedTag} ${focusedIndex === index ? styles.focused : ''}`}
                    onClick={() => onTermClick?.(item.term)}
                    onKeyDown={(e) => {
                      onKeyDown?.(e);
                    }}
                    disabled={loading}
                    title="Click to insert at cursor"
                    onMouseEnter={() => onMouseEnter?.(index)}
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
