/**
 * SearchInput Component
 * Advanced search input with logic operators for LoTUS-BF
 * Adapted from NeurosynthSearch TermInput
 */
import React, { useRef } from 'react';
import { useContext } from 'react';
import { SearchContext } from '../../context/SearchContext.jsx';
import styles from './SearchBar.module.css';

export function SearchInput({
  placeholder = 'Enter search terms with operators (AND, OR, NOT)...',
  onSearch,
}) {
  const inputRef = useRef(null);
  const { query, setQuery } = useContext(SearchContext);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Trigger search with current query
      if (query && query.trim().length > 0) {
        onSearch?.(query.trim());
      }
    }
  };

  const handleFocus = () => {
    // Optional: Show suggestions on focus
  };

  return (
    <div className={styles.searchInputWrapper}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={styles.searchInput}
        aria-label="Search with operators"
        aria-autocomplete="list"
        aria-controls="autocompletePopup"
      />
      <span className={styles.searchIcon}>🔍</span>
    </div>
  );
}
