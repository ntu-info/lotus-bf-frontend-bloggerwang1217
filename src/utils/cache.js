/**
 * Cache Management System
 */

import { API_CONFIG } from './constants';

class CacheManager {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Generate a cache key
   */
  generateKey(endpoint, params = {}) {
    const paramStr = Object.entries(params)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    return `${endpoint}?${paramStr}`;
  }

  /**
   * Set a cache entry
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
   * Get a cache entry
   */
  get(endpoint, params = {}) {
    const key = this.generateKey(endpoint, params);
    const entry = this.cache.get(key);

    if (!entry) {
      console.log(`[Cache] MISS ${key}`);
      return null;
    }

    // Check for expiration
    if (entry.expiresAt !== Infinity && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      console.log(`[Cache] EXPIRED ${key}`);
      return null;
    }

    console.log(`[Cache] HIT ${key}`);
    return entry.data;
  }

  /**
   * Check if a valid cache entry exists
   */
  has(endpoint, params = {}) {
    return this.get(endpoint, params) !== null;
  }

  /**
   * Clear a single cache entry
   */
  clear(endpoint, params = {}) {
    const key = this.generateKey(endpoint, params);
    this.cache.delete(key);
    console.log(`[Cache] CLEAR ${key}`);
  }

  /**
   * Clear all cache entries
   */
  clearAll() {
    this.cache.clear();
    console.log('[Cache] CLEAR ALL');
  }

  /**
   * Get cache statistics
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

// Singleton instance
const cacheManager = new CacheManager();

export default cacheManager;

/**
 * API call wrapper with caching
 */
export const withCache = async (endpoint, params, apiCallFn, cacheDuration) => {
  // First, check the cache
  const cachedData = cacheManager.get(endpoint, params);
  if (cachedData) {
    return cachedData;
  }

  // Execute the API call
  try {
    const data = await apiCallFn();
    
    // Save to cache
    cacheManager.set(endpoint, params, data, cacheDuration);
    
    return data;
  } catch (error) {
    console.error(`[Cache] API call failed for ${endpoint}:`, error);
    throw error;
  }
};
