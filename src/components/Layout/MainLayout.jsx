/**
 * MainLayout Component
 * Three-column layout: LeftPanel (trends) | CenterPanel (papers) | RightPanel (3D viewer)
 */
import React, { useCallback, useContext } from 'react';
import { SearchContext } from '../../context/SearchContext.jsx';
import { fetchStudies, fetchLocations, fetchHelp } from '../../utils/api';
import { formatTrendData, formatJournalData } from '../../utils/stats';
import { SearchContainer } from '../SearchBar';
import { LeftPanel } from '../LeftPanel';
import { StudiesList } from '../CenterPanel';
import { NiiViewer } from '../RightPanel';
import styles from './MainLayout.module.css';

export function MainLayout() {
  const {
    query,
    studies,
    setStudies,
    setLocations,
    setTrendData,
    setJournalData,
    setRelatedTerms,
    loading,
    setLoading,
    error,
    setError,
    setPage,
  } = useContext(SearchContext);

  const handleSearch = useCallback(
    async (searchQuery) => {
      if (!searchQuery || searchQuery.trim().length === 0) {
        setError('Please enter a search term');
        return;
      }

      setLoading(true);
      setError('');
      setPage(1);

      try {
        // Fetch studies
        const studiesResponse = await fetchStudies(searchQuery);
        // API returns { results: [...], count: number }
        const studiesArray = studiesResponse?.results || [];
        setStudies(studiesArray);

        // Calculate statistics
        if (studiesArray && studiesArray.length > 0) {
          // Trend data (year over time)
          const trendFormatted = formatTrendData(studiesArray);
          setTrendData(trendFormatted);

          // Journal data (top 20 journals)
          const journalFormatted = formatJournalData(studiesArray, 20);
          setJournalData(journalFormatted);
        } else {
          setError(`No studies found for "${searchQuery}". Try a different search term.`);
          setTrendData([]);
          setJournalData([]);
          setRelatedTerms([]);
        }

        // Fetch locations (for future use)
        try {
          const locationsData = await fetchLocations(searchQuery);
          setLocations(locationsData || []);
        } catch (err) {
          console.warn('Error fetching locations:', err);
        }

        // Fetch help/context (optional)
        try {
          await fetchHelp(searchQuery);
        } catch (err) {
          console.warn('Error fetching help:', err);
        }
      } catch (err) {
        setError(err.message || 'Search failed');
        setStudies([]);
        setTrendData([]);
        setJournalData([]);
      } finally {
        setLoading(false);
      }
    },
    [setStudies, setLocations, setTrendData, setJournalData, setRelatedTerms, setLoading, setError, setPage]
  );

  return (
    <div className={styles.mainLayout}>
      {/* Search Bar Header */}
      <header className={styles.header}>
        <SearchContainer onSearch={handleSearch} />
      </header>

      {/* Error Message */}
      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️ {error}</span>
          <button
            className={styles.closeError}
            onClick={() => setError('')}
            aria-label="Close error"
          >
            ✕
          </button>
        </div>
      )}

      {/* Three-Column Layout */}
      <div className={styles.container}>
        <aside className={styles.leftColumn}>
          <LeftPanel />
        </aside>

        <main className={styles.centerColumn}>
          <div className={styles.panelContent}>
            <StudiesList studies={studies} isLoading={loading} />
          </div>
        </main>

        <aside className={styles.rightColumn}>
          <div className={styles.rightPanelWrapper}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>🧠 Brain Map</h2>
            </div>
            <div className={styles.panelContent}>
              <NiiViewer query={query} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
