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
import { ToastContainer } from '../Common/ToastContainer';
import { useToast } from '../../hooks/useToast';
import styles from './MainLayout.module.css';

export function MainLayout() {
  const toast = useToast();
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
    searchSuccess,
    setSearchSuccess,
    setPage,
    setTotalCount,
  } = useContext(SearchContext);

  const handleSearch = useCallback(
    async (searchQuery) => {
      if (!searchQuery || searchQuery.trim().length === 0) {
        toast.warning('Please enter a search term');
        setError('');
        return;
      }

      setLoading(true);
      setPage(1);
      setError('');

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
          setTrendData([]);
          setJournalData([]);
          setRelatedTerms([]);
          setTotalCount(0);
        }

        // 搜尋成功（無論結果如何）
        setSearchSuccess(true);

        // Fetch other data in parallel
        fetchLocations(searchQuery).then(setLocations).catch(err => console.warn('Error fetching locations:', err));
        fetchHelp(searchQuery).catch(err => console.warn('Error fetching help:', err));

      } catch (err) {
        // 搜尋失敗，不呼叫 right panel，不顯示 toast
        setSearchSuccess(false);
        setStudies([]);
        setTrendData([]);
        setJournalData([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    [setStudies, setLocations, setTrendData, setJournalData, setRelatedTerms, setLoading, setError, setPage, setTotalCount, setSearchSuccess, toast]
  );

  // With client-side pagination, this just needs to set the page number
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    // Scroll to top of center panel might be a good UX improvement here
  }, [setPage]);

  return (
    <div className={styles.mainLayout}>
      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Search Bar Header */}
      <header className={styles.header}>
        <SearchContainer onSearch={handleSearch} />
      </header>

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
              <NiiViewer query={query} searchSuccess={searchSuccess} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
