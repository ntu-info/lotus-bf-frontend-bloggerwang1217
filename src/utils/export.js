/**
 * Export utility functions - supports CSV, JSON, and BibTeX formats
 */

/**
 * Export a list of studies to CSV format
 * @param {Array} studies - The list of studies
 * @param {string} filename - The output filename
 */
export const exportToCSV = (studies = [], filename = 'studies.csv') => {
  if (!studies || studies.length === 0) {
    console.warn('No studies to export');
    return;
  }

  // CSV headers
  const headers = ['Study ID', 'Title', 'Authors', 'Journal', 'Year', 'DOI', 'PubMed'];

  // Prepare data rows
  const rows = studies.map(study => [
    study.study_id || '',
    `"${(study.title || '').replace(/"/g, '""')}"`, // Escape double quotes
    `"${(study.authors || '').replace(/"/g, '""')}"`,
    `"${(study.journal || '').replace(/"/g, '""')}"`,
    study.year || '',
    study.doi || '',
    study.study_id ? `https://pubmed.ncbi.nlm.nih.gov/${study.study_id}/` : ''
  ]);

  // Combine into CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Download the file
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};

/**
 * Export a list of studies to JSON format
 * @param {Array} studies - The list of studies
 * @param {string} filename - The output filename
 */
export const exportToJSON = (studies = [], filename = 'studies.json') => {
  if (!studies || studies.length === 0) {
    console.warn('No studies to export');
    return;
  }

  const jsonContent = JSON.stringify(studies, null, 2);
  downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
};

/**
 * Export a list of studies to BibTeX format
 * @param {Array} studies - The list of studies
 * @param {string} filename - The output filename
 */
export const exportToBibTeX = (studies = [], filename = 'studies.bib') => {
  if (!studies || studies.length === 0) {
    console.warn('No studies to export');
    return;
  }

  const bibtexEntries = studies.map((study, index) => {
    const key = (study.study_id || `study${index}`).replace(/[^a-zA-Z0-9_-]/g, '');

    let entry = `@article{${key},`;

    if (study.title) entry += `  title={${study.title}},`;
    if (study.authors) entry += `  author={${study.authors}},`;
    if (study.journal) entry += `  journal={${study.journal}},`;
    if (study.year) entry += `  year={${study.year}},`;
    if (study.doi) entry += `  doi={${study.doi}},`;
    if (study.study_id) entry += `  pmid={${study.study_id}},`;

    entry = entry.replace(/,$/, ''); // Remove trailing comma
    entry += `}`;

    return entry;
  }).join('\n\n');

  downloadFile(bibtexEntries, filename, 'text/plain;charset=utf-8;');
};

/**
 * Export a list of studies to TSV format (for spreadsheets)
 * @param {Array} studies - The list of studies
 * @param {string} filename - The output filename
 */
export const exportToTSV = (studies = [], filename = 'studies.tsv') => {
  if (!studies || studies.length === 0) {
    console.warn('No studies to export');
    return;
  }

  // TSV headers
  const headers = ['Study ID', 'Title', 'Authors', 'Journal', 'Year', 'DOI', 'PubMed'];

  // Prepare data rows
  const rows = studies.map(study => [
    study.study_id || '',
    study.title || '',
    study.authors || '',
    study.journal || '',
    study.year || '',
    study.doi || '',
    study.study_id ? `https://pubmed.ncbi.nlm.nih.gov/${study.study_id}/` : ''
  ]);

  // Combine into TSV content
  const tsvContent = [
    headers.join('\t'),
    ...rows.map(row => row.join('\t'))
  ].join('\n');

  downloadFile(tsvContent, filename, 'text/tab-separated-values;charset=utf-8;');
};

/**
 * Helper function to download a file
 * @param {string} content - The file content
 * @param {string} filename - The filename
 * @param {string} mimeType - The MIME type
 */
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate a filename with a timestamp
 * @param {string} baseName - The base filename (without extension)
 * @param {string} extension - The file extension
 * @returns {string} The filename with a timestamp
 */
export const generateFilename = (baseName = 'studies', extension = 'csv') => {
  const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `${baseName}_${timestamp}.${extension}`;
};
