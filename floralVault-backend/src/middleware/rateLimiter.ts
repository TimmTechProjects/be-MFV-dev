import rateLimit from 'express-rate-limit';

/**
 * Public API Rate Limiter
 * 
 * Limits: 100 requests per minute per IP
 * Applied to: Forum threads, post listings, and other public endpoints
 */
export const publicApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '60 seconds',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '60 seconds',
    });
  },
});

/**
 * Search/Expensive Query Rate Limiter
 * 
 * Limits: 30 requests per minute per IP
 * Applied to: Search endpoints and other expensive operations
 */
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP
  message: {
    error: 'Too many search requests, please try again later.',
    retryAfter: '60 seconds',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many search requests, please try again later.',
      retryAfter: '60 seconds',
    });
  },
});
