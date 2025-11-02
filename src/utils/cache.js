/**
 * 快取管理系統
 */

import { API_CONFIG } from './constants';

class CacheManager {
  constructor() {
    this.cache = new Map();
  }

  /**
   * 生成快取鍵
   */
  generateKey(endpoint, params = {}) {
    const paramStr = Object.entries(params)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    return `${endpoint}?${paramStr}`;
  }

  /**
   * 設置快取
   */
  set(endpoint, params, data, duration = Infinity) {
    const key = this.generateKey(endpoint, params);
    const expiresAt = duration === Infinity ? Infinity : Date.now() + duration;
    
    this.cache.set(key, {
      data,
      expiresAt,
      timestamp: Date.now()
    });

    console.log(`[Cache] SET ${key} (expires in ${duration}ms)`);
  }

  /**
   * 獲取快取
   */
  get(endpoint, params = {}) {
    const key = this.generateKey(endpoint, params);
    const entry = this.cache.get(key);

    if (!entry) {
      console.log(`[Cache] MISS ${key}`);
      return null;
    }

    // 檢查過期
    if (entry.expiresAt !== Infinity && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      console.log(`[Cache] EXPIRED ${key}`);
      return null;
    }

    console.log(`[Cache] HIT ${key}`);
    return entry.data;
  }

  /**
   * 檢查是否存在有效快取
   */
  has(endpoint, params = {}) {
    return this.get(endpoint, params) !== null;
  }

  /**
   * 清除單個快取
   */
  clear(endpoint, params = {}) {
    const key = this.generateKey(endpoint, params);
    this.cache.delete(key);
    console.log(`[Cache] CLEAR ${key}`);
  }

  /**
   * 清除所有快取
   */
  clearAll() {
    this.cache.clear();
    console.log('[Cache] CLEAR ALL');
  }

  /**
   * 獲取快取統計
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        timestamp: value.timestamp,
        expiresAt: value.expiresAt,
        expiresIn: value.expiresAt === Infinity 
          ? 'Never' 
          : Math.max(0, value.expiresAt - Date.now()) + 'ms'
      }))
    };
  }
}

// 單例模式
const cacheManager = new CacheManager();

export default cacheManager;

/**
 * 使用快取的 API 呼叫包裝器
 */
export const withCache = async (endpoint, params, apiCallFn, cacheDuration) => {
  // 首先檢查快取
  const cachedData = cacheManager.get(endpoint, params);
  if (cachedData) {
    return cachedData;
  }

  // 執行 API 呼叫
  try {
    const data = await apiCallFn();
    
    // 保存到快取
    cacheManager.set(endpoint, params, data, cacheDuration);
    
    return data;
  } catch (error) {
    console.error(`[Cache] API call failed for ${endpoint}:`, error);
    throw error;
  }
};
