/**
 * ExportButton Component - 匯出結果數據
 * 支援 CSV、JSON、BibTeX、TSV 四種格式
 */

import React, { useState, useContext, useRef, useEffect } from 'react';
import { SearchContext } from '../../context/SearchContext';
import { useToast } from '../../hooks/useToast';
import { exportToCSV, exportToJSON, exportToBibTeX, exportToTSV, generateFilename } from '../../utils/export';
import styles from './ExportButton.module.css';

export function ExportButton({ studies: filteredStudies }) {
  const { query } = useContext(SearchContext);
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Use filtered studies from props (already filtered by year/journal)
  const studies = filteredStudies;

  // Close dropdown when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen]);

  const handleExport = (format) => {
    if (!studies || studies.length === 0) {
      toast.warning('No studies to export');
      setIsOpen(false);
      return;
    }

    try {
      const baseName = query ? `studies_${query.replace(/\s+/g, '_')}` : 'studies';
      const filename = generateFilename(baseName, format);

      switch (format) {
        case 'csv':
          exportToCSV(studies, filename);
          break;
        case 'json':
          exportToJSON(studies, filename);
          break;
        case 'bibtex':
          exportToBibTeX(studies, filename);
          break;
        case 'tsv':
          exportToTSV(studies, filename);
          break;
        default:
          toast.error('Unknown format');
          return;
      }

      toast.success(`Exported ${studies.length} studies as ${format.toUpperCase()}`);
      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export: ${error.message}`);
    }
  };

  const isDisabled = !studies || studies.length === 0;

  return (
    <div className={styles.exportContainer} ref={dropdownRef}>
      <button
        className={`${styles.exportButton} ${isDisabled ? styles.disabled : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDisabled}
        title="Export search results"
      >
        Export
      </button>

      {isOpen && !isDisabled && (
        <div className={styles.exportMenu}>
          <button
            className={styles.menuItem}
            onClick={() => handleExport('csv')}
            title="Export as CSV (Excel compatible)"
          >
            CSV
          </button>
          <button
            className={styles.menuItem}
            onClick={() => handleExport('json')}
            title="Export as JSON (for programming)"
          >
            JSON
          </button>
          <button
            className={styles.menuItem}
            onClick={() => handleExport('bibtex')}
            title="Export as BibTeX (for citation managers)"
          >
            BibTeX
          </button>
          <button
            className={styles.menuItem}
            onClick={() => handleExport('tsv')}
            title="Export as TSV (Tab-separated, for spreadsheets)"
          >
            TSV
          </button>
        </div>
      )}

      {isOpen && isDisabled && (
        <div className={styles.exportMenu}>
          <div className={styles.menuItemDisabled}>
            No data to export
          </div>
        </div>
      )}
    </div>
  );
}
