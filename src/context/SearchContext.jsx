/**
 * SearchContext - 全局搜尋狀態管理
 */

import { createContext, useCallback, useState } from 'react';

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  // 搜尋框狀態
  const [query, setQuery] = useState('');
  const [operator, setOperator] = useState('AND');
  
  // 查詢結果
  const [studies, setStudies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [niiData, setNiiData] = useState(null);
  
  // UI 狀態
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);


  
  // 相關詞和建議
  const [relatedTerms, setRelatedTerms] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  
  // 趨勢數據（前端計算）
  const [trendData, setTrendData] = useState(null);
  const [journalData, setJournalData] = useState(null);

  // 重置狀態
  const reset = useCallback(() => {
    setStudies([]);
    setLocations([]);
    setNiiData(null);
    setError(null);
    setCurrentPage(1);
    setTotalCount(0);
    setRelatedTerms([]);
    setTrendData(null);
    setJournalData(null);
  }, []);

  return (
    <SearchContext.Provider
      value={{
        // 搜尋框
        query,
        setQuery,
        operator,
        setOperator,
        
        // 結果
        studies,
        setStudies,
        locations,
        setLocations,
        niiData,
        setNiiData,
        
        // UI
        loading,
        setLoading,
        error,
        setError,
        currentPage,
        setCurrentPage,
        setPage: setCurrentPage,
        totalCount,
        setTotalCount,
        
        // 建議
        relatedTerms,
        setRelatedTerms,
        suggestions,
        setSuggestions,
        
        // 趨勢
        trendData,
        setTrendData,
        journalData,
        setJournalData,
        
        // 方法
        reset
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
