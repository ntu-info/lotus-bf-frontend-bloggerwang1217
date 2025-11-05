/**
 * DownloadMapButton Component
 * Allows downloading NIfTI brain map in various formats
 * Styled to match ExportButton
 */

import React, { useMemo } from 'react';
import { API_CONFIG } from '../../utils/constants';
import styles from './DownloadMapButton.module.css';

export function DownloadMapButton({ query, searchSuccess = false }) {
  // Map URL construction - mirrors NiiViewer logic
  const mapUrl = useMemo(() => {
    if (!query || !searchSuccess) return '';
    const u = new URL(`${API_CONFIG.BASE_URL}/query/${encodeURIComponent(query)}/nii`);
    u.searchParams.set('voxel', '2.0');
    u.searchParams.set('fwhm', '10.0');
    u.searchParams.set('kernel', 'gauss');
    u.searchParams.set('r', '6.0');
    return u.toString();
  }, [query, searchSuccess]);

  const isDisabled = !mapUrl;

  return (
    <a
      href={mapUrl}
      download={query ? `brain_map_${query.replace(/\s+/g, '_')}.nii.gz` : 'brain_map.nii.gz'}
      className={`${styles.downloadButton} ${isDisabled ? styles.disabled : ''}`}
      title="Download NIfTI brain map"
      onClick={(e) => {
        if (isDisabled) {
          e.preventDefault();
        }
      }}
    >
      Download Map
    </a>
  );
}
