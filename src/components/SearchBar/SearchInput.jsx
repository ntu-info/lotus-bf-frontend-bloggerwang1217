/**
 * SearchInput Component
 * Advanced search input with logic operators for LoTUS-BF
 * Handles input changes, keyboard navigation, and clearing
 */
import React, { useRef, useContext } from 'react';
import { SearchContext } from '../../context/SearchContext.jsx';
import styles from './SearchBar.module.css';

export function SearchInput({
  placeholder = 'Enter search term, e.g., amygdala AND fear',
  onSearch,
  onKeyDown,        // 父元件傳入的鍵盤處理（用於自動完成導航）
  showClearButton = true,
  onClear,
  inputRef: parentInputRef, // Ref from parent for keyboard navigation
}) {
  const localInputRef = useRef(null);
  const inputRef = parentInputRef || localInputRef;
  const { query, setQuery } = useContext(SearchContext);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    // 先呼叫父元件的 keydown 處理（鍵盤導航）
    onKeyDown?.(e);

    // 如果沒有被消費，再檢查 Enter 是否觸發搜尋
    if (!e.defaultPrevented && e.key === 'Enter') {
      if (query && query.trim().length > 0) {
        onSearch?.(query.trim());
      }
    }
  };

  const handleClear = () => {
    setQuery('');
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <div className={styles.searchInputWrapper}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={styles.searchInput}
        aria-label="Search with operators"
        aria-autocomplete="list"
        aria-controls="autocompletePopup"
      />
      {showClearButton && query && (
        <button
          onClick={handleClear}
          className={styles.clearButton}
          aria-label="Clear search"
          title="Clear search (Ctrl+A to select all)"
        >
          ✕
        </button>
      )}
    </div>
  );
}
