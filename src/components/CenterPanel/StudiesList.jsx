/**
 * StudiesList Component
 * Displays search results in a flat list format, matching the prototype design.
 */
import React, { useContext } from 'react';
import { getPubMedUrl } from '../../utils/stats';
import { SearchContext } from '../../context/SearchContext.jsx';
import styles from './CenterPanel.module.css';

export function StudiesList({ studies = [], isLoading = false }) {
  const { currentPage, pageSize, query } = useContext(SearchContext);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading studies...</p>
      </div>
    );
  }

  if (studies.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>
          {query
            ? `No studies found for "${query}". Try a different query.`
            : 'Search for a query to view results'}
        </p>
      </div>
    );
  }

  const startIndex = (currentPage - 1) * pageSize;

  return (
    <div className={styles.studiesList}>
      {studies.map((study, index) => {
        const rawId = study.pubmed_id || study.id || study.study_id || '';
        const pmid = rawId.split('-')[0];
        const pubmedUrl = getPubMedUrl(pmid);
        const doiUrl = study.doi ? `https://doi.org/${study.doi}` : null;

        return (
          <div key={rawId} className={styles.studyItem}>
            {/* Left Column: Number and Cite button */}
            <div className={styles.studyLeft}>
              <span className={styles.studyNumber}>{startIndex + index + 1}</span>
              <button className={styles.citeButton}>Cite</button>
            </div>

            {/* Right Column: Study Details */}
            <div className={styles.studyRight}>
              <a
                href={pubmedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.studyTitle}
              >
                {study.title}
              </a>
              <p className={styles.studyAuthors}>{study.authors}</p>
              <p className={styles.studyMeta}>
                {study.journal && <span className={styles.journal}>{study.journal}.</span>}
                {study.year && <span>{study.year}.</span>}
                {doiUrl && (
                  <a href={doiUrl} target="_blank" rel="noopener noreferrer" className={styles.doiLink}>
                    doi: {study.doi}
                  </a>
                )}
              </p>
              <p className={styles.studyPmid}>PMID: {pmid}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
