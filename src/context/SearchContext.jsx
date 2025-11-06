/**
 * SearchContext - Global search state management
 */

import { createContext, useCallback, useState } from 'react';

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  // Search box state
  const [query, setQuery] = useState('');
  const [operator, setOperator] = useState(null);

  // Query results
  const [studies, setStudies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [niiData, setNiiData] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchSuccess, setSearchSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(30); // Number of items per page

  // Sort state
  const [sortField, setSortField] = useState('year');      // year, journal, title, authors
  const [sortDirection, setSortDirection] = useState('desc'); // asc, desc

  // Filter state (triggered by chart clicks)
  const [filters, setFilters] = useState({
    year: null,       // Selected year
    journal: null,    // Selected journal name
  });

  // Related terms and suggestions
  const [relatedTerms, setRelatedTerms] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  // Trend data (calculated on the frontend)
  const [trendData, setTrendData] = useState(null);
  const [journalData, setJournalData] = useState(null);

  // Reset state
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
    setFilters({ year: null, journal: null });
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
        searchSuccess,
        setSearchSuccess,
        currentPage,
        setCurrentPage,
        setPage: setCurrentPage,
        totalCount,
        setTotalCount,
        pageSize,
        setPageSize,

        // 排序
        sortField,
        setSortField,
        sortDirection,
        setSortDirection,

        // 篩選器
        filters,
        setFilters,

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
