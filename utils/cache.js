import NodeCache from 'node-cache';
import { recordCacheHit, recordCacheMiss } from './metrics.js';
import { logInfo, logWarn } from './logger.js';

// Optional global cache disable (useful in development)
const cacheDisabled = process.env.CACHE_DISABLED === 'true';

// Create cache instance with default TTL of 10 minutes
const cache = new NodeCache({
  stdTTL: 600, // 10 minutes default
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false, // Don't clone objects for better performance
});

// Cache statistics
let cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
};

// Cache event listeners
cache.on('set', (key, value) => {
  cacheStats.sets++;
  logInfo(`Cache SET: ${key}`, { cacheSize: cache.getStats().keys });
});

cache.on('del', (key, value) => {
  cacheStats.deletes++;
  logInfo(`Cache DEL: ${key}`);
});

cache.on('expired', (key, value) => {
  logInfo(`Cache EXPIRED: ${key}`);
});

cache.on('flush', () => {
  logInfo('Cache FLUSH: All keys cleared');
  cacheStats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
});

/**
 * Get value from cache
 */
export const get = (key) => {
  if (cacheDisabled) return null;
  const value = cache.get(key);
  if (value !== undefined) {
    cacheStats.hits++;
    logInfo(`Cache HIT: ${key}`);
    return value;
  }
  cacheStats.misses++;
  logInfo(`Cache MISS: ${key}`);
  return null;
};

/**
 * Set value in cache with optional TTL
 */
export const set = (key, value, ttl = null) => {
  if (cacheDisabled) return false;
  const success = cache.set(key, value, ttl);
  if (success) {
    logInfo(`Cache SET: ${key}`, { ttl: ttl || 'default' });
  } else {
    logWarn(`Cache SET failed: ${key}`);
  }
  return success;
};

/**
 * Delete value from cache
 */
export const del = (key) => {
  if (cacheDisabled) return true;
  const deleted = cache.del(key);
  if (deleted > 0) {
    logInfo(`Cache DEL: ${key}`);
  }
  return deleted > 0;
};

/**
 * Check if key exists in cache
 */
export const has = (key) => {
  return cache.has(key);
};

/**
 * Get cache statistics
 */
export const getStats = () => {
  const nodeCacheStats = cache.getStats();
  return {
    ...cacheStats,
    ...nodeCacheStats,
    hitRate: cacheStats.hits / (cacheStats.hits + cacheStats.misses) || 0,
  };
};

/**
 * Clear all cache entries
 */
export const flushAll = () => {
  cache.flushAll();
  logInfo('Cache flushed');
};

/**
 * Get all cache keys
 */
export const getKeys = () => {
  return cache.keys();
};

/**
 * Middleware to cache API responses
 */
export const cacheMiddleware = (keyGenerator, ttl = null) => {
  return (req, res, next) => {
    const key = typeof keyGenerator === 'function' ? keyGenerator(req) : keyGenerator;

    // Try to get from cache
    const cachedData = get(key);
    if (cachedData) {
      logInfo(`Serving from cache: ${key}`);
      return res.json(cachedData);
    }

    // Store original json method
    const originalJson = res.json;

    // Override json method to cache the response
    res.json = function(data) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        set(key, data, ttl);
      }
      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Cache key generators for common patterns
 */
export const cacheKeys = {
  // Generate cache key for registered days by date range
  registeredDays: (startDate, endDate) => `registered_days_${startDate}_${endDate}`,

  // Generate cache key for vacation days
  vacationDays: () => 'vacation_days',
  vacationDaysDetailed: () => 'vacation_days_detailed',

  // Generate cache key for API responses
  apiResponse: (method, url, params = {}) => {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `api_${method}_${url}${paramString ? `_${paramString}` : ''}`;
  },

  // Generate cache key for user-specific data
  userData: (userId, type) => `user_${userId}_${type}`,
};

export default cache;
