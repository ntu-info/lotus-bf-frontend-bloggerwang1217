/**
 * SearchContainer Component
 * Complete search integration with a two-column layout matching the prototype.
 */
import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useDebounce } from '../../hooks';
import { SearchContext } from '../../context/SearchContext.jsx';
import { fetchTerms, fetchRelatedTerms } from '../../utils/api';
import { AutocompletePopup, LogicOperatorButtons, RelatedTermsTags } from './index';
import styles from './SearchBar.module.css';

const OPERATORS = ['AND', 'OR', 'NOT'];

export function SearchContainer({ onSearch }) {
  const { query, setQuery, relatedTerms, setRelatedTerms, setLoading } = useContext(SearchContext);
  
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allTerms, setAllTerms] = useState([]);
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

  // Auto-search and load related terms when query changes
  useEffect(() => {
    const trimmedQuery = debouncedQuery.trim();
    
    if (trimmedQuery.length > 0) {
      onSearch?.(trimmedQuery);
    }
    
    if (trimmedQuery.length > 0 && !trimmedQuery.includes(' ') && !OPERATORS.some(op => trimmedQuery.toUpperCase().includes(op))) {
      setRelatedLoading(true);
      fetchRelatedTerms(trimmedQuery)
        .then((data) => {
          const related = Array.isArray(data) ? data : (data?.related || []);
          const sorted = related.sort((a, b) => (b.co_count || 0) - (a.co_count || 0)).slice(0, 10);
          setRelatedTerms(sorted);
        })
        .catch(() => setRelatedTerms([]))
        .finally(() => setRelatedLoading(false));
    } else {
      setRelatedTerms([]);
    }
  }, [debouncedQuery, setRelatedTerms, onSearch]);

  const handleSuggestionSelect = (term) => {
    const cursorPos = inputRef.current.selectionStart || 0;
    const textBeforeCursor = query.substring(0, cursorPos);
    const lastSpace = Math.max(textBeforeCursor.lastIndexOf(' '), textBeforeCursor.lastIndexOf('('), textBeforeCursor.lastIndexOf(')'));
    const beforeLastSpace = textBeforeCursor.substring(0, lastSpace + 1);
    const newQuery = `${beforeLastSpace}${term} `;
    setQuery(newQuery);
    setShowSuggestions(false);
  };

  const handleRelatedTermClick = (term) => {
    setQuery(prevQuery => {
      const trimmedQuery = prevQuery.trim();
      if (trimmedQuery === '') {
        return term; // If query is empty, just set the term
      }
      // Otherwise, append with AND
      return `${trimmedQuery} AND ${term}`;
    });
    setShowSuggestions(false);
  };

  const handleKeyDown = useCallback((e) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex((idx) => (idx + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex((idx) => (idx - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  }, [showSuggestions, suggestions, selectedSuggestionIndex]);

  useEffect(() => {
    const lastWord = query.substring(query.lastIndexOf(' ') + 1);
    if (lastWord) {
      const filtered = allTerms.filter(t => t.toLowerCase().startsWith(lastWord.toLowerCase())).slice(0, 10);
      setShowSuggestions(filtered.length > 0);
      setSuggestions(filtered);
      setSelectedSuggestionIndex(-1);
    } else {
      setShowSuggestions(false);
    }
  }, [query, allTerms]);

  return (
    <div className={styles.searchContainer}>
      {/* Left Column */}
      <div className={styles.logoWrapper}>
        <img src={`${import.meta.env.BASE_URL}LoTUS-BF_logo.png`} alt="LoTUS-BF Logo" className={styles.logoImage} />
        <div className={styles.logoTextWrapper}>
          <h1 className={styles.logoTitle}>LoTUS-BF</h1>
          <p className={styles.logoSubtitle}>Location-or-Term Unified Search for Brain Functions</p>
        </div>
      </div>

      {/* Right Column */}
      <div className={styles.searchControls}>
        <div className={styles.operatorGroup}>
          <LogicOperatorButtons />
        </div>

        <div className={styles.searchInputWrapper}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter search term, e.g., amygdala AND fear"
            className={styles.searchInput}
            aria-autocomplete="list"
            aria-controls="autocompletePopup"
          />
          {query && (
            <button onClick={() => setQuery('')} className={styles.clearButton} aria-label="Clear search">
              ×
            </button>
          )}
          <AutocompletePopup
            suggestions={suggestions}
            visible={showSuggestions}
            selectedIndex={selectedSuggestionIndex}
            onSelect={handleSuggestionSelect}
            onHover={setSelectedSuggestionIndex}
            prefix={query.substring(query.lastIndexOf(' ') + 1)}
          />
        </div>

                <div className={styles.relatedTagsContainer}>
          <span className={styles.relatedTagsLabel}>Related terms:</span>
          <RelatedTermsTags 
            terms={relatedTerms} 
            onTermClick={handleRelatedTermClick}
            loading={relatedLoading}
          />
        </div>
      </div>
    </div>
  );
}
