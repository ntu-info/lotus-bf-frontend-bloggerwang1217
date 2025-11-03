/**
 * SearchContainer Component
 * Complete search integration with a two-column layout matching the prototype.
 * Handles search logic, autocomplete, operator buttons, and related terms.
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
  
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allTerms, setAllTerms] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // 焦點管理：追蹤當前焦點在哪個區域
  const [focusedArea, setFocusedArea] = useState('input');  // 'input' | 'operators' | 'relatedTerms'
  const [focusedOperatorIndex, setFocusedOperatorIndex] = useState(0);
  const [focusedRelatedTermIndex, setFocusedRelatedTermIndex] = useState(0);

  const termsLoadedRef = useRef(false);
  const inputRef = useRef(null);
  const onSearchRef = useRef(onSearch);

  // 保持 onSearch 引用最新
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

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

  // Auto-search when query changes (debounced)
  useEffect(() => {
    const trimmedQuery = debouncedQuery.trim();

    if (trimmedQuery.length > 0) {
      onSearchRef.current?.(trimmedQuery);
    }
  }, [debouncedQuery]);

  // Load related terms when query changes (debounced)
  useEffect(() => {
    const trimmedQuery = debouncedQuery.trim();

    // 取最後一個字（排除運算符和括號）
    const words = trimmedQuery.split(/\s+/).filter(Boolean);

    // 一直往前找，直到找到非運算符的詞
    let lastWord = '';
    for (let i = words.length - 1; i >= 0; i--) {
      const word = words[i].replace(/[()]/g, ''); // 移除括號
      if (word && !OPERATORS.includes(word.toUpperCase())) {
        lastWord = word;
        break;
      }
    }

    if (lastWord && lastWord.length > 0) {
      setRelatedLoading(true);
      fetchRelatedTerms(lastWord)
        .then((data) => {
          const related = Array.isArray(data) ? data : (data?.related || []);

          // 按 jaccard 排序取前 10
          const jaccardTop10 = [...related]
            .sort((a, b) => (b.jaccard || 0) - (a.jaccard || 0))
            .slice(0, 10);

          // 按 co_count 排序取前 10
          const coCountTop10 = [...related]
            .sort((a, b) => (b.co_count || 0) - (a.co_count || 0))
            .slice(0, 10);

          // 找出交集（兩邊都有的）
          const jaccardTerms = new Set(jaccardTop10.map(item => item.term));
          const coCountTerms = new Set(coCountTop10.map(item => item.term));
          const intersection = jaccardTop10.filter(item => coCountTerms.has(item.term));

          // 找出其餘的（聯集 - 交集）
          const jaccardOnly = jaccardTop10.filter(item => !coCountTerms.has(item.term));
          const coCountOnly = coCountTop10.filter(item => !jaccardTerms.has(item.term));

          // 合併：交集優先，其餘接在後面
          const sorted = [...intersection, ...jaccardOnly, ...coCountOnly];
          setRelatedTerms(sorted);
        })
        .catch(() => setRelatedTerms([]))
        .finally(() => setRelatedLoading(false));
    } else {
      setRelatedTerms([]);
    }
  }, [debouncedQuery, setRelatedTerms]);

  const handleSuggestionSelect = (term) => {
    const cursorPos = inputRef.current.selectionStart || 0;
    const textBeforeCursor = query.substring(0, cursorPos);
    const lastSpace = Math.max(textBeforeCursor.lastIndexOf(' '), textBeforeCursor.lastIndexOf('('), textBeforeCursor.lastIndexOf(')'));
    const beforeLastSpace = textBeforeCursor.substring(0, lastSpace + 1);
    const newQuery = `${beforeLastSpace}${term} `;
    setQuery(newQuery);
    setShowSuggestions(false);
  };

  // 無條件直接插入相關詞到末尾
  const handleRelatedTermClick = (term) => {
    setQuery(prevQuery => {
      const trimmedQuery = prevQuery.trim();
      // 無條件插入：如果 query 為空直接返回該詞，否則加空格後追加
      return trimmedQuery === '' ? term : `${trimmedQuery} ${term}`;
    });
    setShowSuggestions(false);
  };

  // 實作運算符按鈕點擊處理
  const handleOperatorClick = useCallback((operator) => {
    setQuery(prevQuery => {
      const trimmed = prevQuery.trim();
      if (trimmed === '') {
        // 空查詢時，不插入運算符
        return '';
      }
      // 如果已以空格結尾，直接追加；否則先加空格再追加運算符和空格
      const suffix = trimmed.endsWith(' ') ? operator : ` ${operator}`;
      return `${trimmed}${suffix} `;
    });
    // 注意：SearchInput 元件內部會自動聚焦，無需在此處理
  }, [setQuery]);

  const handleKeyDown = useCallback((e) => {
    const { key } = e;

    // Handle autocomplete navigation
    if (showSuggestions && suggestions.length > 0) {
      if (key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex((idx) => (idx + 1) % suggestions.length);
        setFocusedArea('input');
        return;
      } else if (key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex((idx) => (idx - 1 + suggestions.length) % suggestions.length);
        setFocusedArea('input');
        return;
      } else if (key === 'Enter' && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
        return;
      } else if (key === 'Escape') {
        setShowSuggestions(false);
        setFocusedArea('input');
        return;
      }
    }

    // Handle navigation when autocomplete is not visible
    if (focusedArea === 'input') {
      if (key === 'ArrowUp' && !showSuggestions) {
        e.preventDefault();
        setFocusedArea('operators');
        setFocusedOperatorIndex(1); // Default to OR (middle)
        return;
      } else if (key === 'ArrowDown' && !showSuggestions) {
        e.preventDefault();
        setFocusedArea('relatedTerms');
        setFocusedRelatedTermIndex(0);
        return;
      }
      // Allow left/right arrow keys in input for cursor movement
    } else if (focusedArea === 'operators') {
      if (key === 'ArrowDown') {
        e.preventDefault();
        setFocusedArea('input');
        inputRef.current?.focus();
        return;
      } else if (key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedOperatorIndex((idx) => (idx - 1 + OPERATORS.length) % OPERATORS.length);
        return;
      } else if (key === 'ArrowRight') {
        e.preventDefault();
        setFocusedOperatorIndex((idx) => (idx + 1) % OPERATORS.length);
        return;
      } else if (key === 'Enter') {
        e.preventDefault();
        handleOperatorClick(OPERATORS[focusedOperatorIndex]);
        setFocusedArea('input');
        inputRef.current?.focus();
        return;
      } else if (key === 'Escape') {
        e.preventDefault();
        setFocusedArea('input');
        inputRef.current?.focus();
        return;
      }
    } else if (focusedArea === 'relatedTerms') {
      if (key === 'ArrowUp') {
        e.preventDefault();
        setFocusedArea('input');
        inputRef.current?.focus();
        return;
      } else if (key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedRelatedTermIndex((idx) => (idx - 1 + relatedTerms.length) % relatedTerms.length);
        return;
      } else if (key === 'ArrowRight') {
        e.preventDefault();
        setFocusedRelatedTermIndex((idx) => (idx + 1) % relatedTerms.length);
        return;
      } else if (key === 'Enter') {
        e.preventDefault();
        handleRelatedTermClick(relatedTerms[focusedRelatedTermIndex].term);
        setFocusedArea('input');
        inputRef.current?.focus();
        return;
      } else if (key === 'Escape') {
        e.preventDefault();
        setFocusedArea('input');
        inputRef.current?.focus();
        return;
      }
    }
  }, [showSuggestions, suggestions, selectedSuggestionIndex, focusedArea, focusedOperatorIndex, focusedRelatedTermIndex, relatedTerms]);

  useEffect(() => {
    const lastWord = query.substring(query.lastIndexOf(' ') + 1);
    if (lastWord) {
      const filtered = allTerms
        .filter(t => t.toLowerCase().startsWith(lastWord.toLowerCase()) && !OPERATORS.includes(t.toUpperCase()))
        .slice(0, 10);
      setShowSuggestions(filtered.length > 0);
      setSuggestions(filtered);
      setSelectedSuggestionIndex(-1);
    } else {
      setShowSuggestions(false);
    }
  }, [query, allTerms]);

  // Handle mouse enter on operators - clear keyboard focus
  const handleOperatorMouseEnter = useCallback(() => {
    if (focusedArea === 'operators') {
      setFocusedArea('input');
    }
  }, [focusedArea]);

  // Handle mouse enter on related terms - clear keyboard focus
  const handleRelatedTermMouseEnter = useCallback(() => {
    if (focusedArea === 'relatedTerms') {
      setFocusedArea('input');
    }
  }, [focusedArea]);

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
        <div className={styles.controlsTopRow}>
          <div className={styles.operatorGroup}>
            <LogicOperatorButtons
              onOperatorClick={handleOperatorClick}
              focusedIndex={focusedArea === 'operators' ? focusedOperatorIndex : undefined}
              onMouseEnter={handleOperatorMouseEnter}
            />
          </div>
        </div>

        {/* Search Input Container with Autocomplete */}
        <div className={styles.searchInputContainer}>
          {/* Search Input Component with built-in clear button */}
          <SearchInput
            placeholder="Enter search term, e.g., amygdala AND fear"
            onKeyDown={handleKeyDown}
            onSearch={onSearch}
            showClearButton={true}
            onClear={() => setRelatedTerms([])}
            inputRef={inputRef}
          />

          {/* Autocomplete Popup */}
          <AutocompletePopup
            suggestions={suggestions}
            visible={showSuggestions}
            selectedIndex={selectedSuggestionIndex}
            onSelect={handleSuggestionSelect}
            onHover={setSelectedSuggestionIndex}
            prefix={query.substring(query.lastIndexOf(' ') + 1)}
          />
        </div>

        {/* Related Terms - label always visible, show terms or loading state */}
        <div className={styles.relatedTagsContainer}>
          <span className={styles.relatedTagsLabel}>Related terms:</span>
          {!showSuggestions && (relatedTerms.length > 0 || relatedLoading) && (
            <RelatedTermsTags
              terms={relatedTerms}
              onTermClick={handleRelatedTermClick}
              loading={relatedLoading}
              focusedIndex={focusedArea === 'relatedTerms' ? focusedRelatedTermIndex : -1}
              onMouseEnter={handleRelatedTermMouseEnter}
            />
          )}
        </div>
      </div>
    </div>
  );
}
