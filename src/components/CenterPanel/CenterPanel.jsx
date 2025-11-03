/**
 * CenterPanel Component
 * Encapsulates the studies list and pagination, and handles client-side slicing of results.
 */
import React, { useContext } from 'react';
import { SearchContext } from '../../context/SearchContext.jsx';
import { StudiesList } from './StudiesList';
import { Pagination } from './Pagination';
import { PAGINATION } from '../../utils/constants';
import styles from './CenterPanel.module.css';

export function CenterPanel({ onPageChange }) {
  const {
    query,
    studies, // This is now the full list of studies
    loading,
    currentPage,
    totalCount,
  } = useContext(SearchContext);

  // Client-side pagination: slice the full list of studies for the current page
  const startIndex = (currentPage - 1) * PAGINATION.STUDIES_PER_PAGE;
  const endIndex = startIndex + PAGINATION.STUDIES_PER_PAGE;
  const paginatedStudies = studies.slice(startIndex, endIndex);

  return (
    <div className={styles.centerPanel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>
          {query && totalCount > 0 ? (
            `Results for "${query}" (${totalCount.toLocaleString()} found)`
          ) : (
            'Results'
          )}
        </h2>
        
        {totalCount > 0 && (
          <Pagination
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={PAGINATION.STUDIES_PER_PAGE}
            onPageChange={onPageChange}
          />
        )}
      </div>

      <div className={styles.panelContent}>
        {/* Pass the sliced array to the list component */}
        <StudiesList studies={paginatedStudies} isLoading={loading} />
      </div>
    </div>
  );
}
