const ApiError = require('../utils/ApiError');

// sliding window rate limiter — no external dependencies
const store = new Map();

const CLEANUP_INTERVAL = 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now - entry.windowStart > entry.windowMs * 2) store.delete(key);
  }
}, CLEANUP_INTERVAL);

const rateLimiter = ({ windowMs = 60000, max = 100, message = 'Too many requests' } = {}) => {
  return (req, res, next) => {
    const key = req.user?._id?.toString() || req.ip;
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || now - entry.windowStart > windowMs) {
      entry = { windowStart: now, count: 0, windowMs };
      store.set(key, entry);
    }

    entry.count += 1;

    const remaining = Math.max(0, max - entry.count);
    const resetAt = entry.windowStart + windowMs;

    res.set('X-RateLimit-Limit', String(max));
    res.set('X-RateLimit-Remaining', String(remaining));
    res.set('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));

    if (entry.count > max) {
      throw new ApiError(429, message, 'RATE_LIMITED');
    }

    next();
  };
};

module.exports = rateLimiter;
