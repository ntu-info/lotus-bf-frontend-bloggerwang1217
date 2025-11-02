/**
 * API 層 - 複製自 NeurosynthSearch，使用 fetch + AbortController
 * 支持 TTL 緩存、請求取消、完整的錯誤處理
 */

import { API_CONFIG } from './constants';

// ========== 配置 ==========
const CONFIG = {
  API_BASE: API_CONFIG.BASE_URL,
  DEBOUNCE_MS: 300,
  MIN_LENGTH: 1,
  CACHE_TTL: {
    terms: Infinity,        // 詞庫永久緩存
    related: 5 * 60 * 1000, // 相關詞 5 分鐘
    studies: 5 * 60 * 1000, // 論文 5 分鐘
    locations: 10 * 60 * 1000, // 座標 10 分鐘
    nii: 10 * 60 * 1000,    // NIfTI 10 分鐘
  }
};

// ========== 快取系統 ==========
const cache = {
  terms: new Map(),
  related: new Map(),
  studies: new Map(),
  locations: new Map(),
  nii: new Map(),
  timestamps: {
    terms: new Map(),
    related: new Map(),
    studies: new Map(),
    locations: new Map(),
    nii: new Map(),
  }
};

// ========== 請求取消控制 ==========
const abortControllers = {
  terms: null,
  related: null,
  studies: null,
  locations: null,
  nii: null,
};

// ========== 工具函數 ==========

function isCacheFresh(type, key) {
  const timestamp = cache.timestamps[type]?.get(key);
  if (!timestamp) return false;
  const ttl = CONFIG.CACHE_TTL[type];
  if (ttl === Infinity) return true;
  return Date.now() - timestamp < ttl;
}

function setCacheEntry(type, key, value) {
  cache[type].set(key, value);
  if (cache.timestamps[type]) {
    cache.timestamps[type].set(key, Date.now());
  }
}

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
  if (cache.terms.size > 0) {
    return cache.terms.get('all') || [];
  }

  try {
    const controller = cancelRequest('terms');
    const response = await fetch(`${CONFIG.API_BASE}/terms`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const terms = data.terms || [];
    cache.terms.set('all', terms);
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
  if (isCacheFresh('related', term)) {
    return cache.related.get(term) || [];
  }

  try {
    const controller = cancelRequest('related');
    const response = await fetch(`${CONFIG.API_BASE}/terms/${encodeURIComponent(term)}`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const related = data.related || [];
    setCacheEntry('related', term, related);
    return related;
  } catch (error) {
    if (error.name === 'AbortError') return [];
    console.error('[API] Error fetching related terms:', error);
    return [];
  }
};

// ========== 查詢相關 API ==========

/**
 * 查詢論文
 * @param {string} query - 查詢字符串 (支持 AND/OR/NOT/座標等)
 * @param {number} limit - 分頁限制
 * @param {number} offset - 分頁偏移
 */
export const fetchStudies = async (query, limit = 30, offset = 0) => {
  const cacheKey = `${query}:${limit}:${offset}`;
  if (isCacheFresh('studies', cacheKey)) {
    return cache.studies.get(cacheKey) || {};
  }

  try {
    const controller = cancelRequest('studies');
    const encodedQuery = encodeURIComponent(query);
    const url = new URL(`${CONFIG.API_BASE}/query/${encodedQuery}/studies`);
    url.searchParams.append('limit', limit);
    url.searchParams.append('offset', offset);

    const response = await fetch(url.toString(), {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    setCacheEntry('studies', cacheKey, data);
    return data;
  } catch (error) {
    if (error.name === 'AbortError') return null;
    console.error('[API] Error fetching studies:', error);
    return null;
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
  const cacheKey = `${query}:${limit}:${offset}:${r}`;
  if (isCacheFresh('locations', cacheKey)) {
    return cache.locations.get(cacheKey) || {};
  }

  try {
    const controller = cancelRequest('locations');
    const encodedQuery = encodeURIComponent(query);
    const url = new URL(`${CONFIG.API_BASE}/query/${encodedQuery}/locations`);
    url.searchParams.append('limit', limit);
    url.searchParams.append('offset', offset);
    url.searchParams.append('r', r);

    const response = await fetch(url.toString(), {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    setCacheEntry('locations', cacheKey, data);
    return data;
  } catch (error) {
    if (error.name === 'AbortError') return null;
    console.error('[API] Error fetching locations:', error);
    return null;
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
  const cacheKey = `${query}:${voxel}:${fwhm}:${kernel}`;
  if (isCacheFresh('nii', cacheKey)) {
    return cache.nii.get(cacheKey) || null;
  }

  try {
    const controller = cancelRequest('nii');
    const encodedQuery = encodeURIComponent(query);
    const url = new URL(`${CONFIG.API_BASE}/query/${encodedQuery}/nii`);
    url.searchParams.append('voxel', voxel);
    url.searchParams.append('fwhm', fwhm);
    url.searchParams.append('kernel', kernel);

    const response = await fetch(url.toString(), {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const blob = await response.blob();
    setCacheEntry('nii', cacheKey, blob);
    return blob;
  } catch (error) {
    if (error.name === 'AbortError') return null;
    console.error('[API] Error fetching NII image:', error);
    return null;
  }
};

/**
 * 獲取後端幫助信息
 */
export const fetchHelp = async () => {
  try {
    const response = await fetch(`${CONFIG.API_BASE}/help`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[API] Error fetching help:', error);
    return null;
  }
};

// ========== 清除快取 ==========
export const clearCache = (type = null) => {
  if (type) {
    cache[type].clear();
    cache.timestamps[type].clear();
  } else {
    Object.keys(cache).forEach(key => {
      if (key !== 'timestamps') cache[key].clear();
    });
    Object.keys(cache.timestamps).forEach(key => {
      cache.timestamps[key].clear();
    });
  }
};
