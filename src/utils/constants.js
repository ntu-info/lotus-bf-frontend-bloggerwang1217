/**
 * 常數定義 - LoTUS-BF × Neurosynth
 */

// ========== API 配置 ==========
export const API_CONFIG = {
  BASE_URL: 'https://mil.psy.ntu.edu.tw:5000', // LoTUS-BF 後端 URL (生產環境)
  // 開發環境可改為：'http://localhost:5000'
  TIMEOUT: 10000,
  CACHE_DURATION: {
    TERMS: Infinity,        // 詞庫永久快取
    STUDIES: 5 * 60 * 1000, // 論文 5 分鐘
    LOCATIONS: 5 * 60 * 1000, // 座標 5 分鐘
    NII: 10 * 60 * 1000,    // NIfTI 10 分鐘
  }
};

// ========== API 端點 ==========
export const API_ENDPOINTS = {
  TERMS: '/terms',
  TERM_DETAIL: (term) => `/terms/${encodeURIComponent(term)}`,
  QUERY_STUDIES: (query) => `/query/${encodeURIComponent(query)}/studies`,
  QUERY_LOCATIONS: (query) => `/query/${encodeURIComponent(query)}/locations`,
  QUERY_NII: (query) => `/query/${encodeURIComponent(query)}/nii`,
};

// ========== 色彩系統 ==========
export const COLORS = {
  coral: {
    primary: '#FF7F50',
    light: '#FFA07A',
    dark: '#FF6347'
  },
  tiffany: {
    primary: '#40E0D0',
    light: '#7FFFD4',
    dark: '#00CED1'
  },
  tag: {
    success: '#20C997',
    light: '#51CF66',
    dark: '#0F8446'
  },
  neutral: {
    bgMain: '#FFFFFF',
    bgCard: '#F8F9FA',
    bgHeader: '#F1F3F5',
    textPrimary: '#212529',
    textSecondary: '#6C757D',
    border: '#DEE2E6'
  }
};

// ========== 邏輯運算符 ==========
export const OPERATORS = [
  { id: 'AND', label: 'AND', symbol: '∧' },
  { id: 'OR', label: 'OR', symbol: '∨' },
  { id: 'NOT', label: 'NOT', symbol: '¬' },
];

// ========== 分頁設置 ==========
export const PAGINATION = {
  STUDIES_PER_PAGE: 30,
  LOCATIONS_PER_PAGE: 100,
  RELATED_TERMS_LIMIT: 10,
};

// ========== 搜尋建議 ==========
export const SEARCH_CONFIG = {
  DEBOUNCE_DELAY: 300, // 防抖延遲 (ms)
  MIN_QUERY_LENGTH: 1,
  AUTOCOMPLETE_LIMIT: 8,
};

// ========== NIfTI 參數預設值 ==========
export const NIFTI_DEFAULTS = {
  percentile: 95,
  voxelSize: 2.0,
  fwhm: 10.0,
  kernel: 'gauss', // 'gauss' or 'uniform'
  overlayAlpha: 0.8,
};

// ========== 圖表配置 ==========
export const CHART_CONFIG = {
  TREND_CHART: {
    height: 300,
    margin: { top: 5, right: 30, left: 0, bottom: 5 },
    colors: ['#FF7F50', '#FFA07A'],
  },
  JOURNAL_CHART: {
    height: 400,
    margin: { top: 5, right: 30, left: 100, bottom: 5 },
    colors: ['#40E0D0', '#7FFFD4'],
    topCount: 20,
  },
};

// ========== PubMed URL ==========
export const PUBMED_BASE_URL = 'https://pubmed.ncbi.nlm.nih.gov';

// ========== 本地存儲鍵值 ==========
export const STORAGE_KEYS = {
  SEARCH_HISTORY: 'lotus-search-history',
  FAVORITES: 'lotus-favorites',
  USER_PREFERENCES: 'lotus-preferences',
};

// ========== 應用信息 ==========
export const APP_INFO = {
  NAME: 'LoTUS-BF × Neurosynth',
  VERSION: '1.0.0',
  TAGLINE: 'Location-or-Term Unified Search for Brain Functions',
};
