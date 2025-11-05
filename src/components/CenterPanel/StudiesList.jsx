/**
 * StudiesList Component
 * Displays search results in a flat list format, matching the prototype design.
 */
import React, { useContext } from 'react';
import { getPubMedUrl } from '../../utils/stats';
import { SearchContext } from '../../context/SearchContext.jsx';
import { useToast } from '../../hooks/useToast';
import styles from './CenterPanel.module.css';

export function StudiesList({ studies = [], isLoading = false }) {
  const { currentPage, pageSize, query } = useContext(SearchContext);
  const toast = useToast();

  const generateCitation = (study) => {
    // Format: Authors. Title. Journal. Year. doi. Epub. PMID.
    const parts = [];

    // Authors
    if (study.authors) {
      parts.push(`${study.authors}.`);
    }

    // Title
    if (study.title) {
      parts.push(`${study.title}.`);
    }

    // Journal
    if (study.journal) {
      parts.push(`${study.journal}.`);
    }

    // Year
    if (study.year) {
      parts.push(`${study.year}.`);
    }

    // Volume and pages if available
    if (study.volume || study.pages) {
      const volumePages = [];
      if (study.volume) volumePages.push(study.volume);
      if (study.pages) volumePages.push(study.pages);
      parts.push(`${volumePages.join(';')}.`);
    }

    // DOI
    if (study.doi) {
      parts.push(`doi: ${study.doi}.`);
    }

    // Epub date if available
    if (study.epub_date) {
      parts.push(`Epub ${study.epub_date}.`);
    }

    // PMID
    const rawId = study.pubmed_id || study.id || study.study_id || '';
    const pmid = rawId.split('-')[0];
    if (pmid) {
      parts.push(`PMID: ${pmid}.`);
    }

    return parts.join(' ');
  };

  const handleCite = (study) => {
    const citation = generateCitation(study);
    
    // Copy to clipboard
    navigator.clipboard.writeText(citation).then(() => {
      toast.success('Citation copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy citation');
    });
  };

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
              <button className={styles.citeButton} onClick={() => handleCite(study)}>Cite</button>
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
