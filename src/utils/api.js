/**
 * API 層 - 使用 fetch + AbortController
 * 整合了 cacheManager 進行快取、請求取消、完整的錯誤處理
 */

import { API_CONFIG, API_ENDPOINTS } from './constants';
import cacheManager from './cache';

// ========== 請求取消控制 ==========
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

// ========== 詞庫相關 API ==========

/**
 * 獲取所有詞庫 (用於自動完成建議)
 * @returns {Promise<Array>} 所有詞彙的陣列
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
 * 獲取相關詞 (帶 co-occurrence count 和 Jaccard 距離)
 * @param {string} term - 術語
 * @returns {Promise<Array>} 相關詞陣列
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

// ========== 查詢相關 API ==========

/**
 * 查詢論文 (獲取全部結果)
 * @param {string} query - 查詢字符串 (支持 AND/OR/NOT/座標等)
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
 * 查詢激活座標
 * @param {string} query - 查詢字符串
 * @param {number} limit - 限制數量
 * @param {number} offset - 偏移量
 * @param {number} r - 搜尋半徑 (mm)
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
 * 查詢 NIfTI 3D 影像
 * @param {string} query - 查詢字符串
 * @param {number} voxel - 體素大小 (mm)
 * @param {number} fwhm - 高斯平滑 FWHM (mm)
 * @param {string} kernel - 核函數 ('gauss' or 'uniform')
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
 * 獲取後端幫助信息
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

// ========== 清除快取 ==========
export const clearCache = (endpoint = null, params = {}) => {
  if (endpoint) {
    cacheManager.clear(endpoint, params);
  } else {
    cacheManager.clearAll();
  }
};
