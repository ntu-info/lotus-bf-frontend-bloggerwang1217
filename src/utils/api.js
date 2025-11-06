/**
 * API Layer - using fetch + AbortController
 * Integrates cacheManager for caching, request cancellation, and full error handling
 */

import { API_CONFIG, API_ENDPOINTS } from './constants';
import cacheManager from './cache';

// ========== Request Cancellation Control ==========
const abortControllers = {
  terms: null,
  related: null,
  studies: null,
  locations: null,
  nii: null,
};

function cancelRequest(type) {
  if (abortControllers[type]) {
    abortControllers[type].abort();
  }
  abortControllers[type] = new AbortController();
  return abortControllers[type];
}

// ========== Term-related APIs ==========

/**
 * Fetch all terms (for autocomplete suggestions)
 * @returns {Promise<Array>} Array of all terms
 */
export const fetchTerms = async () => {
  const endpoint = API_ENDPOINTS.TERMS;
  const params = {};
  const cachedData = cacheManager.get(endpoint, params);
  if (cachedData) {
    return cachedData;
  }

  try {
    const controller = cancelRequest('terms');
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const terms = data.terms || [];
    cacheManager.set(endpoint, params, terms, API_CONFIG.CACHE_DURATION.TERMS);
    return terms;
  } catch (error) {
    if (error.name === 'AbortError') return [];
    console.error('[API] Error fetching terms:', error);
    return [];
  }
};

/**
 * Fetch related terms (with co-occurrence count and Jaccard distance)
 * @param {string} term - The term
 * @returns {Promise<Array>} Array of related terms
 */
export const fetchRelatedTerms = async (term) => {
  const endpoint = API_ENDPOINTS.TERM_DETAIL(term);
  const params = {};
  const cachedData = cacheManager.get(endpoint, params);
  if (cachedData) {
    return cachedData;
  }

  try {
    const controller = cancelRequest('related');
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const related = data.related || [];
    cacheManager.set(endpoint, params, related, API_CONFIG.CACHE_DURATION.RELATED);
    return related;
  } catch (error) {
    if (error.name === 'AbortError') return [];
    console.error('[API] Error fetching related terms:', error);
    return [];
  }
};

// ========== Query-related APIs ==========

/**
 * Query for studies (fetch all results)
 * @param {string} query - The query string (supports AND/OR/NOT/coordinates, etc.)
 */
export const fetchStudies = async (query) => {
  const endpoint = API_ENDPOINTS.QUERY_STUDIES(query);
  const params = {}; // No params for full fetch
  const cachedData = cacheManager.get(endpoint, params);
  if (cachedData) {
    return cachedData;
  }

  try {
    const controller = cancelRequest('studies');
    const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`);

    const response = await fetch(url.toString(), {
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    cacheManager.set(endpoint, params, data, API_CONFIG.CACHE_DURATION.STUDIES);
    return data;
  } catch (error) {
    if (error.name === 'AbortError') return null; // Do not treat cancellation as an error
    console.error('[API] Error fetching studies:', error);
    throw error; // Re-throw for the UI layer to handle
  }
};

/**
 * Query for activation coordinates
 * @param {string} query - The query string
 * @param {number} limit - The number of results to return
 * @param {number} offset - The offset of the results
 * @param {number} r - The search radius (mm)
 */
export const fetchLocations = async (query, limit = 100, offset = 0, r = 6.0) => {
  const endpoint = API_ENDPOINTS.QUERY_LOCATIONS(query);
  const params = { limit, offset, r };
  const cachedData = cacheManager.get(endpoint, params);
  if (cachedData) {
    return cachedData;
  }

  try {
    const controller = cancelRequest('locations');
    const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`);
    url.searchParams.append('limit', limit);
    url.searchParams.append('offset', offset);
    url.searchParams.append('r', r);

    const response = await fetch(url.toString(), {
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    cacheManager.set(endpoint, params, data, API_CONFIG.CACHE_DURATION.LOCATIONS);
    return data;
  } catch (error) {
    if (error.name === 'AbortError') return null;
    console.error('[API] Error fetching locations:', error);
    throw error;
  }
};

/**
 * Query for NIfTI 3D image
 * @param {string} query - The query string
 * @param {number} voxel - The voxel size (mm)
 * @param {number} fwhm - The FWHM of the Gaussian smoothing kernel (mm)
 * @param {string} kernel - The kernel function ('gauss' or 'uniform')
 */
export const fetchNiiImage = async (query, voxel = 2.0, fwhm = 10.0, kernel = 'gauss') => {
  const endpoint = API_ENDPOINTS.QUERY_NII(query);
  const params = { voxel, fwhm, kernel };
  const cachedData = cacheManager.get(endpoint, params);
  if (cachedData) {
    return cachedData;
  }

  try {
    const controller = cancelRequest('nii');
    const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`);
    url.searchParams.append('voxel', voxel);
    url.searchParams.append('fwhm', fwhm);
    url.searchParams.append('kernel', kernel);

    const response = await fetch(url.toString(), {
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const blob = await response.blob();
    cacheManager.set(endpoint, params, blob, API_CONFIG.CACHE_DURATION.NII);
    return blob;
  } catch (error) {
    if (error.name === 'AbortError') return null;
    console.error('[API] Error fetching NII image:', error);
    throw error;
  }
};

/**
 * Fetch help information from the backend
 */
export const fetchHelp = async () => {
  // This one is not cached, which is fine.
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/help`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[API] Error fetching help:', error);
    throw error;
  }
};

// ========== Clear Cache ==========
export const clearCache = (endpoint = null, params = {}) => {
  if (endpoint) {
    cacheManager.clear(endpoint, params);
  } else {
    cacheManager.clearAll();
  }
};
