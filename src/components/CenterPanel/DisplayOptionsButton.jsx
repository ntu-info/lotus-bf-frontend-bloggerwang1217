/**
 * DisplayOptionsButton Component - Display options gear button
 * Provides options for per-page results count
 */

import React, { useContext, useState, useRef, useEffect } from 'react';
import { SearchContext } from '../../context/SearchContext';
import { PAGE_SIZE_OPTIONS } from '../../utils/constants';
import styles from './DisplayOptionsButton.module.css';

export function DisplayOptionsButton() {
  const { pageSize, setPageSize, setCurrentPage } = useContext(SearchContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
    setIsOpen(false);
  };

  return (
    <div className={styles.displayOptions} ref={dropdownRef}>
      <button
        className={styles.gearButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Display options"
        title="Display options"
      >
        ⚙
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>Display Options</div>
          <div className={styles.optionGroup}>
            <div className={styles.optionLabel}>Per page:</div>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <button
                key={size}
                className={`${styles.optionButton} ${pageSize === size ? styles.active : ''}`}
                onClick={() => handlePageSizeChange(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
