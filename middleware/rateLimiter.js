import rateLimit from 'express-rate-limit';
import { logWarn } from '../utils/logger.js';

/**
 * General API rate limiter
 * - Window: 15 minutes
 * - Max requests: 100 per window
 * - Skip successful requests in logs
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes',
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logWarn('Rate limit exceeded', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
    });

    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes',
      },
    });
  },
  skip: (req, res) => {
    // Skip rate limiting for health checks
    return req.url === '/health' || req.url === '/health/ready' || req.url === '/health/live';
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * - Window: 5 minutes
 * - Max requests: 5 per window
 */
export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again in 5 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logWarn('Auth rate limit exceeded', {
      ip: req.ip,
      url: req.url,
      method: req.method,
    });

    res.status(429).json({
      success: false,
      error: {
        message: 'Too many authentication attempts, please try again in 5 minutes.',
      },
    });
  },
});

/**
 * Rate limiter for form submissions
 * - Window: 10 minutes
 * - Max requests: 10 per window
 */
export const submitLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Limit each IP to 10 submissions per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many form submissions, please try again in 10 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logWarn('Submit rate limit exceeded', {
      ip: req.ip,
      url: req.url,
      method: req.method,
    });

    res.status(429).json({
      success: false,
      error: {
        message: 'Too many form submissions, please try again in 10 minutes.',
      },
    });
  },
});

/**
 * Rate limiter for external API calls (to prevent overwhelming ControlIT)
 * - Window: 1 minute
 * - Max requests: 30 per window
 */
export const externalApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit to 30 external API calls per minute
  message: {
    success: false,
    error: {
      message: 'External API rate limit exceeded, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logWarn('External API rate limit exceeded', {
      ip: req.ip,
      url: req.url,
      method: req.method,
    });

    res.status(429).json({
      success: false,
      error: {
        message: 'External API rate limit exceeded, please try again later.',
      },
    });
  },
});

/**
 * Create custom rate limiter
 */
export const createRateLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || {
      success: false,
      error: {
        message: 'Rate limit exceeded, please try again later.',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logWarn('Custom rate limit exceeded', {
        ip: req.ip,
        url: req.url,
        method: req.method,
        limiter: options.name || 'custom',
      });

      res.status(options.statusCode || 429).json(options.message || {
        success: false,
        error: {
          message: 'Rate limit exceeded, please try again later.',
        },
      });
    },
    skip: options.skip,
  });
};