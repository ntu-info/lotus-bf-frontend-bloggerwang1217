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
// 所有邏輯按鈕：運算符 + 括號 + 座標
const ALL_BUTTONS = ['AND', 'OR', 'NOT', '(', ')', '[,,]'];

export function SearchContainer({ onSearch }) {
  const { query, setQuery, relatedTerms, setRelatedTerms, setLoading } = useContext(SearchContext);
  
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allTerms, setAllTerms] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // 焦點管理：三層架構 (沒有 autocomplete 時)
  // operators (最上) → input-search (中) → relatedTerms (最下)
  const [focusedArea, setFocusedArea] = useState('input-search');  // 'operators' | 'input-search' | 'relatedTerms'
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
      setRelatedTerms([]); // Clear old related terms before loading new ones
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
    const newQuery = `${beforeLastSpace}${term}`;
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

  // 處理括號和座標按鈕
  const handleBracketClick = useCallback((symbol) => {
    setQuery(prevQuery => {
      const trimmed = prevQuery.trim();
      if (symbol === '[,,]') {
        // 座標按鈕：插入 [,,] 並設置游標到第一個逗號前
        const newQuery = trimmed === '' ? '[,,]' : `${trimmed} [,,]`;
        // 延遲設置游標位置到下個事件循環
        setTimeout(() => {
          const cursorPos = newQuery.lastIndexOf('[') + 1; // 移到第一個逗號前
          inputRef.current?.setSelectionRange(cursorPos, cursorPos);
          inputRef.current?.focus();
        }, 0);
        return newQuery;
      } else {
        // 括號按鈕 ( 或 )：直接追加
        const suffix = trimmed.endsWith(' ') || trimmed === '' ? symbol : ` ${symbol}`;
        return `${trimmed}${suffix}`;
      }
    });
  }, [setQuery]);

  const handleKeyDown = useCallback((e) => {
    const { key } = e;

    // ============= AUTOCOMPLETE LAYER (當 autocomplete popup 顯示時) =============
    if (showSuggestions && suggestions.length > 0) {
      if (key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex((idx) => (idx + 1) % suggestions.length);
        return;
      } else if (key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex((idx) => (idx - 1 + suggestions.length) % suggestions.length);
        return;
      } else if (key === 'Enter' && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
        return;
      } else if (key === 'Escape') {
        e.preventDefault();
        setShowSuggestions(false);
        return;
      }
      // 其他鍵不處理，讓 SearchInput 自己處理
      return;
    }

    // ============= THREE-LAYER NAVIGATION (當沒有 autocomplete 時) =============
    
    // 層級1：邏輯按鈕 (OPERATORS)
    if (focusedArea === 'operators') {
      if (key === 'ArrowDown') {
        e.preventDefault();
        setFocusedArea('input-search');
        inputRef.current?.focus();
        return;
      } else if (key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedOperatorIndex((idx) => (idx - 1 + ALL_BUTTONS.length) % ALL_BUTTONS.length);
        return;
      } else if (key === 'ArrowRight') {
        e.preventDefault();
        setFocusedOperatorIndex((idx) => (idx + 1) % ALL_BUTTONS.length);
        return;
      } else if (key === 'Enter') {
        e.preventDefault();
        const buttonLabel = ALL_BUTTONS[focusedOperatorIndex];
        if (buttonLabel === '[,,]' || buttonLabel === '(' || buttonLabel === ')') {
          handleBracketClick(buttonLabel);
        } else {
          handleOperatorClick(buttonLabel);
        }
        return;
      } else if (key === 'Escape') {
        e.preventDefault();
        setFocusedArea('input-search');
        inputRef.current?.focus();
        return;
      }
    }
    
    // 層級2：搜尋框 (INPUT-SEARCH) - 只接收 ↑ / ↓ / Escape，← / → 由 SearchInput 自己處理
    else if (focusedArea === 'input-search') {
      if (key === 'ArrowUp') {
        e.preventDefault();
        setFocusedArea('operators');
        setFocusedOperatorIndex(1); // Default to OR (middle)
        return;
      } else if (key === 'ArrowDown') {
        e.preventDefault();
        setFocusedArea('relatedTerms');
        setFocusedRelatedTermIndex(0);
        return;
      } else if (key === 'Escape') {
        e.preventDefault();
        setFocusedArea('operators');
        setFocusedOperatorIndex(1); // Default to OR (middle)
        return;
      }
      // ← / → 和其他鍵都不在這裡處理，讓 SearchInput 自己處理
    }
    
    // 層級3：相關詞按鈕 (RELATED TERMS) - 直接循環選擇按鈕
    else if (focusedArea === 'relatedTerms') {
      if (key === 'ArrowUp') {
        e.preventDefault();
        setFocusedArea('input-search');
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
      } else if (key === 'Enter' && relatedTerms.length > 0) {
        e.preventDefault();
        handleRelatedTermClick(relatedTerms[focusedRelatedTermIndex].term);
        return;
      } else if (key === 'Escape') {
        e.preventDefault();
        setFocusedArea('input-search');
        inputRef.current?.focus();
        return;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Handle input/clear button focus - clear keyboard layer focus
  const handleInputFocus = useCallback(() => {
    setFocusedArea('input-search');
  }, []);

  // Handle mouse enter on operators - sync keyboard focus with mouse
  const handleOperatorMouseEnter = useCallback((index) => {
    setFocusedArea('operators');
    setFocusedOperatorIndex(index);
  }, []);

  // Handle mouse enter on related terms - sync keyboard focus with mouse
  const handleRelatedTermMouseEnter = useCallback((index) => {
    setFocusedArea('relatedTerms');
    setFocusedRelatedTermIndex(index);
  }, []);

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
              onBracketClick={handleBracketClick}
              focusedIndex={focusedArea === 'operators' ? focusedOperatorIndex : undefined}
              onMouseEnter={handleOperatorMouseEnter}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* Search Input Container with Autocomplete */}
        <div className={styles.searchInputContainer}>
          {/* Search Input Component with built-in clear button */}
          <SearchInput
            placeholder="Enter search term, e.g., amygdala NOT emotion, [0,-18,18] OR [0,0,0]"
            onKeyDown={handleKeyDown}
            onSearch={onSearch}
            showClearButton={true}
            onClear={() => setRelatedTerms([])}
            inputRef={inputRef}
            onInputFocus={handleInputFocus}
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

        {/* Related Terms - container always visible, content conditional */}
        <div className={styles.relatedTagsContainer}>
          {!showSuggestions && (
            <>
              <span className={styles.relatedTagsLabel}>Related terms:</span>
              {(relatedTerms.length > 0 || relatedLoading) && (
                <RelatedTermsTags
                  terms={relatedTerms}
                  onTermClick={handleRelatedTermClick}
                  loading={relatedLoading}
                  focusedIndex={focusedArea === 'relatedTerms' ? focusedRelatedTermIndex : -1}
                  onMouseEnter={handleRelatedTermMouseEnter}
                  onKeyDown={handleKeyDown}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
