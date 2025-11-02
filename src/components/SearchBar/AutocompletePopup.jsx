/**
 * AutocompletePopup Component
 * Displays search suggestions in a dropdown with keyboard navigation
 * Reused from NeurosynthSearch/components/SuggestionsList.jsx
 */
import React from 'react';
import { highlightPrefix } from '../../utils/textUtils';
import styles from './SearchBar.module.css';

export function AutocompletePopup({
  suggestions = [],
  visible = false,
  selectedIndex = -1,
  onSelect,
  onHover,
  prefix = '',
}) {
  if (!visible || suggestions.length === 0) {
    return null;
  }

  return (
    <div className={styles.autocompletePopup} id="autocompletePopup" role="listbox">
      <ul className={styles.suggestionsList} aria-label="Suggestions">
        {suggestions.map((suggestion, index) => (
          <li
            key={`${suggestion}-${index}`}
            className={`${styles.suggestionItem} ${
              index === selectedIndex ? styles.focused : ''
            }`}
            role="option"
            aria-selected={index === selectedIndex}
            onClick={() => onSelect?.(suggestion)}
            onMouseEnter={() => onHover?.(index)}
          >
            <span
              className={styles.suggestionText}
              dangerouslySetInnerHTML={{
                __html: highlightPrefix(suggestion, prefix),
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
