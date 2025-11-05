/**
 * CenterPanel Component
 * Encapsulates the studies list and pagination, and handles client-side slicing of results.
 */
import React, { useContext, useMemo } from 'react';
import { SearchContext } from '../../context/SearchContext.jsx';
import { StudiesList } from './StudiesList';
import { Pagination } from './Pagination';
import { SortControl } from './SortControl';
import { ExportButton } from '../SearchBar/ExportButton';
import { FilterTags } from './FilterTags';
import { PAGINATION } from '../../utils/constants';
import { sortStudies } from '../../utils/stats';
import styles from './CenterPanel.module.css';

export function CenterPanel({ onPageChange }) {
  const {
    query,
    studies, // This is now the full list of studies
    loading,
    currentPage,
    totalCount,
    sortField,
    sortDirection,
    pageSize, // Dynamic page size from context
    filters, // Active filters from chart clicks
  } = useContext(SearchContext);

  // 先根據 filters 過濾，再排序
  const filteredAndSortedStudies = useMemo(() => {
    let filtered = [...studies];

    // Apply year filter
    if (filters.year !== null) {
      filtered = filtered.filter(study => study.year === filters.year);
    }

    // Apply journal filter
    if (filters.journal !== null) {
      filtered = filtered.filter(study => study.journal === filters.journal);
    }

    // Sort the filtered results
    return sortStudies(filtered, sortField, sortDirection);
  }, [studies, filters, sortField, sortDirection]);

  // Client-side pagination: slice the filtered and sorted list
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedStudies = filteredAndSortedStudies.slice(startIndex, endIndex);

  // Calculate filtered count for display
  const filteredCount = filteredAndSortedStudies.length;

  return (
    <div className={styles.centerPanel}>
      <div className={styles.panelHeader}>
        <div className={styles.titleRow}>
          <h2 className={styles.panelTitle}>
            {query && totalCount > 0 ? (
              <>
                Results for "{query}" ({totalCount.toLocaleString()} found
                {filteredCount < totalCount && (
                  <span className={styles.filteredCount}>, {filteredCount.toLocaleString()} after filters</span>
                )}
                )
              </>
            ) : (
              'Results'
            )}
          </h2>
          {totalCount > 0 && <ExportButton studies={filteredAndSortedStudies} />}
        </div>

        {/* Filter Tags */}
        {totalCount > 0 && <FilterTags />}

        <div className={styles.headerControls}>
          {totalCount > 0 && <SortControl />}
          {totalCount > 0 && (
            <Pagination
              currentPage={currentPage}
              totalCount={filteredCount}
              pageSize={pageSize}
              onPageChange={onPageChange}
            />
          )}
        </div>
      </div>

      <div className={styles.panelContent}>
        {/* Pass the sliced array to the list component */}
        <StudiesList studies={paginatedStudies} isLoading={loading} />
      </div>
    </div>
  );
}
