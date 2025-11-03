/**
 * 匯出工具函數 - 支援 CSV、JSON、BibTeX 格式
 */

/**
 * 將論文列表匯出為 CSV 格式
 * @param {Array} studies - 論文列表
 * @param {string} filename - 輸出檔案名稱
 */
export const exportToCSV = (studies = [], filename = 'studies.csv') => {
  if (!studies || studies.length === 0) {
    console.warn('No studies to export');
    return;
  }

  // CSV 表頭
  const headers = ['Study ID', 'Title', 'Authors', 'Journal', 'Year', 'DOI', 'PubMed'];

  // 準備資料列
  const rows = studies.map(study => [
    study.study_id || '',
    `"${(study.title || '').replace(/"/g, '""')}"`, // 轉義雙引號
    `"${(study.authors || '').replace(/"/g, '""')}"`,
    `"${(study.journal || '').replace(/"/g, '""')}"`,
    study.year || '',
    study.doi || '',
    study.study_id ? `https://pubmed.ncbi.nlm.nih.gov/${study.study_id}/` : ''
  ]);

  // 組合成 CSV 內容
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // 下載檔案
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};

/**
 * 將論文列表匯出為 JSON 格式
 * @param {Array} studies - 論文列表
 * @param {string} filename - 輸出檔案名稱
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
 * 將論文列表匯出為 BibTeX 格式
 * @param {Array} studies - 論文列表
 * @param {string} filename - 輸出檔案名稱
 */
export const exportToBibTeX = (studies = [], filename = 'studies.bib') => {
  if (!studies || studies.length === 0) {
    console.warn('No studies to export');
    return;
  }

  const bibtexEntries = studies.map((study, index) => {
    const key = (study.study_id || `study${index}`).replace(/[^a-zA-Z0-9_-]/g, '');

    let entry = `@article{${key},\n`;

    if (study.title) entry += `  title={${study.title}},\n`;
    if (study.authors) entry += `  author={${study.authors}},\n`;
    if (study.journal) entry += `  journal={${study.journal}},\n`;
    if (study.year) entry += `  year={${study.year}},\n`;
    if (study.doi) entry += `  doi={${study.doi}},\n`;
    if (study.study_id) entry += `  pmid={${study.study_id}},\n`;

    entry = entry.replace(/,\n$/, '\n'); // 移除最後一個逗號
    entry += `}\n\n`;

    return entry;
  }).join('');

  downloadFile(bibtexEntries, filename, 'text/plain;charset=utf-8;');
};

/**
 * 將論文列表匯出為 TSV 格式（用於試算表）
 * @param {Array} studies - 論文列表
 * @param {string} filename - 輸出檔案名稱
 */
export const exportToTSV = (studies = [], filename = 'studies.tsv') => {
  if (!studies || studies.length === 0) {
    console.warn('No studies to export');
    return;
  }

  // TSV 表頭
  const headers = ['Study ID', 'Title', 'Authors', 'Journal', 'Year', 'DOI', 'PubMed'];

  // 準備資料列
  const rows = studies.map(study => [
    study.study_id || '',
    study.title || '',
    study.authors || '',
    study.journal || '',
    study.year || '',
    study.doi || '',
    study.study_id ? `https://pubmed.ncbi.nlm.nih.gov/${study.study_id}/` : ''
  ]);

  // 組合成 TSV 內容
  const tsvContent = [
    headers.join('\t'),
    ...rows.map(row => row.join('\t'))
  ].join('\n');

  downloadFile(tsvContent, filename, 'text/tab-separated-values;charset=utf-8;');
};

/**
 * 下載檔案助手函數
 * @param {string} content - 檔案內容
 * @param {string} filename - 檔案名稱
 * @param {string} mimeType - MIME 類型
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
 * 生成帶有時間戳的檔案名稱
 * @param {string} baseName - 基礎檔案名稱（不含副檔名）
 * @param {string} extension - 副檔名
 * @returns {string} 帶有時間戳的檔案名稱
 */
export const generateFilename = (baseName = 'studies', extension = 'csv') => {
  const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `${baseName}_${timestamp}.${extension}`;
};
