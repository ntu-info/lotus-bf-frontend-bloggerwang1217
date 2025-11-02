/**
 * SearchContainer Component
 * Complete search integration with keyboard navigation
 * Copied and adapted from NeurosynthSearch/index.js
 */
import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useDebounce } from '../../hooks';
import { SearchContext } from '../../context/SearchContext.jsx';
import { fetchTerms, fetchRelatedTerms } from '../../utils/api';
import { SearchInput, AutocompletePopup, LogicOperatorButtons, RelatedTermsTags } from './index';
import styles from './SearchBar.module.css';

const OPERATORS = ['AND', 'OR', 'NOT'];

export function SearchContainer({ onSearch }) {
  const { query, setQuery, relatedTerms, setRelatedTerms, setLoading } = useContext(SearchContext);
  
  // Suggestion state
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allTerms, setAllTerms] = useState([]);
  
  // Operator state
  const [showOperatorChooser, setShowOperatorChooser] = useState(false);
  const [operatorIndex, setOperatorIndex] = useState(0);
  const [cursorAfterSpace, setCursorAfterSpace] = useState(0);
  
  // Related terms state
  const [relatedLoading, setRelatedLoading] = useState(false);
  
  const inputRef = useRef(null);
  const termsLoadedRef = useRef(false);
  const debouncedQuery = useDebounce(query, 250);

  // Load all terms on mount
  useEffect(() => {
    if (termsLoadedRef.current) return;
    
    setLoading(true);
    fetchTerms()
      .then((data) => {
        const termsArray = Array.isArray(data) ? data : (data?.terms || []);
        setAllTerms(termsArray);
        termsLoadedRef.current = true;
      })
      .catch((err) => {
        console.error('[SearchContainer] Error loading terms:', err);
        setAllTerms([]);
      })
      .finally(() => setLoading(false));
  }, [setLoading]);

  // Auto-search and load related terms when query changes (debounced)
  useEffect(() => {
    const trimmedQuery = debouncedQuery.trim();
    
    // Auto-trigger search when query is not empty
    if (trimmedQuery.length > 0) {
      console.log('[SearchContainer] Auto-searching for:', trimmedQuery);
      onSearch?.(trimmedQuery);
    }
    
    // Load related terms if query is a single complete word
    if (trimmedQuery.length > 0 && !trimmedQuery.includes(' ') && 
        !OPERATORS.some(op => trimmedQuery.toUpperCase().includes(op))) {
      setRelatedLoading(true);
      fetchRelatedTerms(trimmedQuery)
        .then((data) => {
          const related = Array.isArray(data) ? data : (data?.related || []);
          // Sort by co_count descending, take top 10
          const sorted = related
            .sort((a, b) => (b.co_count || 0) - (a.co_count || 0))
            .slice(0, 10);
          setRelatedTerms(sorted);
        })
        .catch((err) => {
          console.error('[SearchContainer] Error loading related terms:', err);
          setRelatedTerms([]);
        })
        .finally(() => setRelatedLoading(false));
    } else {
      setRelatedTerms([]);
    }
  }, [debouncedQuery, setRelatedTerms, onSearch]);

  // Filter suggestions based on current cursor position
  const updateSuggestions = useCallback(() => {
    if (!inputRef.current) return;

    const cursorPos = inputRef.current.selectionStart || 0;
    const textBeforeCursor = query.substring(0, cursorPos);
    
    // Get the last word before cursor
    const lastSpace = Math.max(
      textBeforeCursor.lastIndexOf(' '),
      textBeforeCursor.lastIndexOf('('),
      textBeforeCursor.lastIndexOf(')')
    );
    
    const lastWord = textBeforeCursor.substring(lastSpace + 1).trim();
    const isOperator = OPERATORS.some(op => op.startsWith(lastWord.toUpperCase()));

    // Check if we should show operator chooser (after space with incomplete operator)
    const shouldShowOperator = lastSpace >= 0 && 
                               lastSpace < cursorPos - 1 && 
                               !isOperator &&
                               lastWord.length > 0 &&
                               lastWord.length < 3; // Still typing operator

    if (shouldShowOperator) {
      setShowOperatorChooser(true);
      setCursorAfterSpace(lastSpace + 1);
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setShowOperatorChooser(false);

    // Filter terms for autocomplete
    if (lastWord.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const queryLower = lastWord.toLowerCase();
    const filtered = allTerms
      .filter((term) => {
        const termStr = typeof term === 'string' ? term : term?.term || '';
        return termStr.toLowerCase().startsWith(queryLower);
      })
      .slice(0, 10)
      .map((term) => (typeof term === 'string' ? term : term?.term || ''));

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setSelectedSuggestionIndex(-1);
  }, [query, allTerms]);

  // Update suggestions when query changes
  useEffect(() => {
    updateSuggestions();
  }, [debouncedQuery, updateSuggestions]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (showOperatorChooser) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setOperatorIndex((idx) => (idx + 1) % OPERATORS.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setOperatorIndex((idx) => (idx - 1 + OPERATORS.length) % OPERATORS.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const operator = OPERATORS[operatorIndex];
        const textBeforeCursor = query.substring(0, cursorAfterSpace);
        const textAfterCursor = query.substring(cursorAfterSpace);
        setQuery(`${textBeforeCursor}${operator} ${textAfterCursor}`);
        setShowOperatorChooser(false);
        setTimeout(() => {
          if (inputRef.current) {
            const newPos = cursorAfterSpace + operator.length + 1;
            inputRef.current.setSelectionRange(newPos, newPos);
            inputRef.current.focus();
          }
        }, 0);
      } else if (e.key === 'Escape') {
        setShowOperatorChooser(false);
      }
    } else if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex((idx) =>
          idx < suggestions.length - 1 ? idx + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex((idx) =>
          idx > 0 ? idx - 1 : suggestions.length - 1
        );
      } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        const selected = suggestions[selectedSuggestionIndex];
        if (inputRef.current) {
          const cursorPos = inputRef.current.selectionStart || 0;
          const textBeforeCursor = query.substring(0, cursorPos);
          const textAfterCursor = query.substring(cursorPos);
          
          const lastSpace = Math.max(
            textBeforeCursor.lastIndexOf(' '),
            textBeforeCursor.lastIndexOf('('),
            textBeforeCursor.lastIndexOf(')')
          );
          
          const beforeLastSpace = textBeforeCursor.substring(0, lastSpace + 1);
          const newQuery = `${beforeLastSpace}${selected} ${textAfterCursor}`.trim();
          setQuery(newQuery);
        }
        
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    } else if (e.key === 'Enter' && query.trim().length > 0) {
      e.preventDefault();
      onSearch?.(query.trim());
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [
    showOperatorChooser,
    showSuggestions,
    suggestions,
    selectedSuggestionIndex,
    operatorIndex,
    query,
    cursorAfterSpace,
    setQuery,
    onSearch,
  ]);

  const handleSuggestionSelect = (term) => {
    if (inputRef.current) {
      const cursorPos = inputRef.current.selectionStart || 0;
      const textBeforeCursor = query.substring(0, cursorPos);
      const textAfterCursor = query.substring(cursorPos);
      
      const lastSpace = Math.max(
        textBeforeCursor.lastIndexOf(' '),
        textBeforeCursor.lastIndexOf('('),
        textBeforeCursor.lastIndexOf(')')
      );
      
      const beforeLastSpace = textBeforeCursor.substring(0, lastSpace + 1);
      const newQuery = `${beforeLastSpace}${term} ${textAfterCursor}`.trim();
      setQuery(newQuery);
    }
    
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleRelatedTermClick = (term) => {
    setQuery(term);
    // Don't auto-search, let user press Enter
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className={styles.searchContainer}>
      {/* Header Row: Logo + Operators */}
      <div className={styles.headerRow}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <img src="/LoTUS-BF_logo.png" alt="LoTUS-BF" className={styles.logoImage} />
          <div className={styles.logoText}>
            <span className={styles.main}>LoTUS-BF</span>
            <span className={styles.sub}>Location-or-Term Unified Search</span>
          </div>
        </div>

        {/* Operator Buttons */}
        <div className={styles.operatorGroup}>
          <LogicOperatorButtons />
        </div>
      </div>

      {/* Search Row */}
      <div className={styles.searchRow}>
        <div className={styles.searchInputWrapper}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter search terms..."
            className={styles.searchInput}
            aria-label="Search with operators"
            aria-autocomplete="list"
            aria-controls="autocompletePopup"
          />

          <AutocompletePopup
            suggestions={suggestions}
            visible={showSuggestions && suggestions.length > 0 && !showOperatorChooser}
            selectedIndex={selectedSuggestionIndex}
            onSelect={handleSuggestionSelect}
            onHover={setSelectedSuggestionIndex}
            prefix={query.substring(Math.max(
              query.lastIndexOf(' '),
              query.lastIndexOf('('),
              query.lastIndexOf(')')
            ) + 1)}
          />
        </div>

        {/* keep spacing for any extra controls on the right of search row */}
        <div style={{ width: 24 }} />
      </div>

      {/* Related Terms Row */}
      {relatedTerms && relatedTerms.length > 0 && (
        <div className={styles.relatedPanel}>
          <span className={styles.relatedTitle}>Related terms:</span>
          <div className={styles.relatedTags}>
            <RelatedTermsTags 
              terms={relatedTerms} 
              onTermClick={handleRelatedTermClick}
              loading={relatedLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
