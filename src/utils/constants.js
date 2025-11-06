/**
 * Constants - LoTUS-BF × Neurosynth
 */

// ========== API Configuration ==========
export const API_CONFIG = {
  BASE_URL: 'https://mil.psy.ntu.edu.tw:5000', // LoTUS-BF backend URL (production)
  // For development, can be changed to: 'http://localhost:5000'
  TIMEOUT: 10000,
  CACHE_DURATION: {
    TERMS: Infinity,        // Terms are cached forever
    RELATED: 5 * 60 * 1000, // Related terms for 5 minutes
    STUDIES: 5 * 60 * 1000, // Studies for 5 minutes
    LOCATIONS: 5 * 60 * 1000, // Locations for 5 minutes
    NII: 10 * 60 * 1000,    // NIfTI for 10 minutes
  }
};

// ========== API Endpoints ==========
export const API_ENDPOINTS = {
  TERMS: '/terms',
  TERM_DETAIL: (term) => `/terms/${encodeURIComponent(term)}`,
  QUERY_STUDIES: (query) => `/query/${encodeURIComponent(query)}/studies`,
  QUERY_LOCATIONS: (query) => `/query/${encodeURIComponent(query)}/locations`,
  QUERY_NII: (query) => `/query/${encodeURIComponent(query)}/nii`,
};

// ========== Color System ==========
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

// ========== Logical Operators ==========
export const OPERATORS = [
  { id: 'AND', label: 'AND', symbol: '∧' },
  { id: 'OR', label: 'OR', symbol: '∨' },
  { id: 'NOT', label: 'NOT', symbol: '¬' },
];

// ========== Pagination Settings ==========
export const PAGINATION = {
  STUDIES_PER_PAGE: 30,
  LOCATIONS_PER_PAGE: 100,
  RELATED_TERMS_LIMIT: 10,
};

// ========== Page Size Options ==========
export const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];

// ========== Search Suggestions ==========
export const SEARCH_CONFIG = {
  DEBOUNCE_DELAY: 300, // Debounce delay (ms)
  MIN_QUERY_LENGTH: 1,
  AUTOCOMPLETE_LIMIT: 8,
};

// ========== NIfTI Parameter Defaults ==========
export const NIFTI_DEFAULTS = {
  percentile: 95,
  voxelSize: 2.0,
  fwhm: 10.0,
  kernel: 'gauss', // 'gauss' or 'uniform'
  overlayAlpha: 0.8,
};

// ========== Chart Configuration ==========
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

// ========== Local Storage Keys ==========
export const STORAGE_KEYS = {
  SEARCH_HISTORY: 'lotus-search-history',
  FAVORITES: 'lotus-favorites',
  USER_PREFERENCES: 'lotus-preferences',
};

// ========== Application Information ==========
export const APP_INFO = {
  NAME: 'LoTUS-BF × Neurosynth',
  VERSION: '1.0.0',
  TAGLINE: 'Location-or-Term Unified Search for Brain Functions',
};
