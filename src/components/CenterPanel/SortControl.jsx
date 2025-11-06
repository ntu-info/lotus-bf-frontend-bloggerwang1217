/**
 * SortControl Component - Sort controls for the study list
 * Provides options for sort field and direction, and display options
 */

import React, { useContext } from 'react';
import { SearchContext } from '../../context/SearchContext';
import { DisplayOptionsButton } from './DisplayOptionsButton';
import styles from './SortControl.module.css';

export function SortControl() {
  const { sortField, setSortField, sortDirection, setSortDirection } = useContext(SearchContext);

  const handleSortFieldChange = (e) => {
    setSortField(e.target.value);
  };

  const handleSortDirectionChange = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className={styles.sortControl}>
      <label htmlFor="sort-field" className={styles.label}>
        Sort by:
      </label>
      <select
        id="sort-field"
        value={sortField}
        onChange={handleSortFieldChange}
        className={styles.select}
      >
        <option value="year">Year</option>
        <option value="journal">Journal</option>
        <option value="title">Title</option>
        <option value="authors">Authors</option>
      </select>

      <button
        onClick={handleSortDirectionChange}
        className={styles.directionButton}
        title={sortDirection === 'asc' ? 'Ascending (↑)' : 'Descending (↓)'}
        aria-label={`Sort direction: ${sortDirection === 'asc' ? 'ascending' : 'descending'}`}
      >
        {sortDirection === 'asc' ? '↑' : '↓'}
      </button>

      {/* Display Options Button */}
      <DisplayOptionsButton />
    </div>
  );
}
