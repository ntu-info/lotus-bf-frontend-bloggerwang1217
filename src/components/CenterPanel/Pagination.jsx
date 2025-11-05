/**
 * Pagination Component
 * Renders pagination controls, matching the prototype design.
 */
import React from 'react';
import styles from './CenterPanel.module.css';

export function Pagination({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className={styles.paginationContainer}>
      {/* First Page Button */}
      <button
        className={styles.paginationBtn}
        onClick={() => handlePageClick(1)}
        disabled={currentPage === 1}
        aria-label="First Page"
      >
        &laquo;
      </button>

      {/* Previous Page Button */}
      <button
        className={styles.paginationBtn}
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous Page"
      >
        &lsaquo;
      </button>

      {/* Page Info Text */}
      <span className={styles.pageInfo}>
        Page {currentPage} of {totalPages.toLocaleString()}
      </span>

      {/* Next Page Button */}
      <button
        className={styles.paginationBtn}
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next Page"
      >
        &rsaquo;
      </button>

      {/* Last Page Button */}
      <button
        className={styles.paginationBtn}
        onClick={() => handlePageClick(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="Last Page"
      >
        &raquo;
      </button>
    </div>
  );
}
