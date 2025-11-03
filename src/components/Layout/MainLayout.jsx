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
import { CenterPanel } from '../CenterPanel/CenterPanel.jsx';
import { NiiViewer } from '../RightPanel';
import styles from './MainLayout.module.css';

export function MainLayout() {
  const {
    query,
    setStudies,
    setLocations,
    setTrendData,
    setJournalData,
    setRelatedTerms,
    setLoading,
    error,
    setError,
    setPage,
    setTotalCount,
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
        // Fetch ALL studies at once
        const studiesResponse = await fetchStudies(searchQuery);
        const studiesArray = studiesResponse?.results || [];
        setStudies(studiesArray);
        setTotalCount(studiesResponse?.count || 0);

        // Calculate statistics from the full dataset
        if (studiesArray.length > 0) {
          const trendFormatted = formatTrendData(studiesArray);
          setTrendData(trendFormatted);

          const journalFormatted = formatJournalData(studiesArray, 20);
          setJournalData(journalFormatted);
        } else {
          setError(`No studies found for "${searchQuery}". Try a different search term.`);
          setTrendData([]);
          setJournalData([]);
          setRelatedTerms([]);
          setTotalCount(0);
        }

        // Fetch other data in parallel
        fetchLocations(searchQuery).then(setLocations).catch(err => console.warn('Error fetching locations:', err));
        fetchHelp(searchQuery).catch(err => console.warn('Error fetching help:', err));

      } catch (err) {
        setError(err.message || 'Search failed');
        setStudies([]);
        setTrendData([]);
        setJournalData([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    [setStudies, setLocations, setTrendData, setJournalData, setRelatedTerms, setLoading, setError, setPage, setTotalCount]
  );

  // With client-side pagination, this just needs to set the page number
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    // Scroll to top of center panel might be a good UX improvement here
  }, [setPage]);

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
          <CenterPanel onPageChange={handlePageChange} />
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
