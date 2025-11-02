/**
 * StudiesList Component
 * Displays search results with PubMed links
 * Adapted from NeurosynthSearch ResultsList
 */
import React, { useState } from 'react';
import { getPubMedUrl } from '../../utils/stats';
import styles from './CenterPanel.module.css';

export function StudiesList({ studies = [], isLoading = false }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpanded = (studyId) => {
    setExpandedId(expandedId === studyId ? null : studyId);
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
        <p>No studies found. Try a different search.</p>
      </div>
    );
  }

  return (
    <div className={styles.studiesList}>
      {studies.map((study) => {
        const isExpanded = expandedId === study.study_id;
        const pubmedUrl = getPubMedUrl(study.pubmed_id || study.id);

        return (
          <article
            key={study.study_id || study.id}
            className={`${styles.studyItem} ${isExpanded ? styles.expanded : ''}`}
          >
            <div
              className={styles.studyHeader}
              onClick={() => toggleExpanded(study.study_id || study.id)}
              role="button"
              tabIndex="0"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  toggleExpanded(study.study_id || study.id);
                }
              }}
            >
              <h3 className={styles.studyTitle}>{study.title}</h3>
              <span className={styles.expandIcon}>
                {isExpanded ? '▼' : '▶'}
              </span>
            </div>

            <div className={styles.studyMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Authors:</span>
                <span className={styles.metaValue}>
                  {study.authors || 'N/A'}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Journal:</span>
                <span className={styles.metaValue}>
                  {study.journal || 'N/A'}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Year:</span>
                <span className={styles.metaValue}>
                  {study.year || 'N/A'}
                </span>
              </div>
            </div>

            {isExpanded && (
              <div className={styles.studyDetails}>
                <p className={styles.abstract}>
                  {study.abstract || 'No abstract available'}
                </p>
                <div className={styles.studyLinks}>
                  {pubmedUrl && (
                    <a
                      href={pubmedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.pubmedLink}
                    >
                      📄 View on PubMed
                    </a>
                  )}
                  {study.url && (
                    <a
                      href={study.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.publicationLink}
                    >
                      🔗 Publication Link
                    </a>
                  )}
                </div>
                <div className={styles.studyIds}>
                  <div>
                    <strong>Study ID:</strong> {study.study_id || study.id}
                  </div>
                  {study.contrast_id && (
                    <div>
                      <strong>Contrast ID:</strong> {study.contrast_id}
                    </div>
                  )}
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
