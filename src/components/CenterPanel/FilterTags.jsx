/**
 * FilterTags Component - Display active filters with remove buttons
 * Shows year and journal filters applied from chart clicks
 */

import React, { useContext } from 'react';
import { SearchContext } from '../../context/SearchContext';
import styles from './FilterTags.module.css';

export function FilterTags() {
  const { filters, setFilters, setCurrentPage } = useContext(SearchContext);

  const hasActiveFilters = filters.year !== null || filters.journal !== null;

  if (!hasActiveFilters) {
    return null;
  }

  const handleRemoveYear = () => {
    setFilters(prev => ({ ...prev, year: null }));
    setCurrentPage(1);
  };

  const handleRemoveJournal = () => {
    setFilters(prev => ({ ...prev, journal: null }));
    setCurrentPage(1);
  };

  const handleClearAll = () => {
    setFilters({ year: null, journal: null });
    setCurrentPage(1);
  };

  return (
    <div className={styles.filterTags}>
      <span className={styles.filterLabel}>Filters:</span>

      {filters.year !== null && (
        <button className={styles.filterTag} onClick={handleRemoveYear}>
          Year: {filters.year}
          <span className={styles.removeIcon}>✕</span>
        </button>
      )}

      {filters.journal !== null && (
        <button className={styles.filterTag} onClick={handleRemoveJournal}>
          Journal: {filters.journal}
          <span className={styles.removeIcon}>✕</span>
        </button>
      )}

      <button className={styles.clearAllButton} onClick={handleClearAll}>
        Clear all
      </button>
    </div>
  );
}
