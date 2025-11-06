/**
 * SearchInput Component
 * Advanced search input with logic operators for LoTUS-BF
 * Handles input changes, keyboard navigation, and clearing
 */
import React, { useRef, useContext } from 'react';
import { SearchContext } from '../../context/SearchContext.jsx';
import styles from './SearchBar.module.css';

export function SearchInput({
  placeholder = 'Enter search term, e.g., amygdala NOT emotion, [0,-18,18] OR [0,0,0]',
  onSearch,
  onKeyDown,        // Keyboard handler from parent component (for autocomplete navigation)
  showClearButton = true,
  onClear,
  inputRef: parentInputRef, // Ref from parent for keyboard navigation
  onInputFocus,     // Called when input or clear button gets focus
}) {
  const localInputRef = useRef(null);
  const inputRef = parentInputRef || localInputRef;
  const clearButtonRef = useRef(null);
  const { query, setQuery } = useContext(SearchContext);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    const { key } = e;

    // ← / → 鍵完全在 SearchInput 層級處理，不向上傳遞
    if (key === 'ArrowRight') {
      // 如果有清除按鈕且游標在末尾，移到清除按鈕
      if (showClearButton && query) {
        const cursorPosition = e.target.selectionStart;
        const textLength = query.length;
        if (cursorPosition === textLength) {
          e.preventDefault();
          clearButtonRef.current?.focus();
          return;
        }
      }
      // 否則允許正常的光標移動（不 preventDefault）
      return;
    }

    if (key === 'ArrowLeft') {
      // ← 允許正常的光標移動（不 preventDefault，不向上傳遞）
      return;
    }

    // 只有 ↑ / ↓ / Escape / Enter 向上傳遞給父元件
    if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'Escape' || key === 'Enter') {
      onKeyDown?.(e);
    }

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
        onFocus={onInputFocus}
        placeholder={placeholder}
        className={styles.searchInput}
        aria-label="Search with operators"
        aria-autocomplete="list"
        aria-controls="autocompletePopup"
      />
      {showClearButton && query && (
        <button
          ref={clearButtonRef}
          onClick={handleClear}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleClear();
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              inputRef.current?.focus();
              // Set cursor to end of text
              const length = query.length;
              inputRef.current?.setSelectionRange(length, length);
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
              // Allow ↑ / ↓ to propagate to parent for layer navigation
              onKeyDown?.(e);
            }
            // Note: ← / → on clear button don't do anything (other than ← above)
          }}
          onFocus={onInputFocus}
          className={styles.clearButton}
          aria-label="Clear search"
          title="Clear search (→ to navigate here, ← to go back)"
        >
          ✕
        </button>
      )}
    </div>
  );
}
