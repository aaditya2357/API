import { Request, Response, NextFunction } from 'express';

// Simple in-memory store for rate limiting
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry>;
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.store = new Map();
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  // Clean up expired entries
  private cleanUp() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  // Check if a key has exceeded rate limit
  public isRateLimited(key: string): boolean {
    this.cleanUp();

    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry) {
      // First request from this key
      this.store.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return false;
    }

    if (now > entry.resetTime) {
      // Window has reset
      this.store.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return false;
    }

    // Increment counter
    entry.count += 1;
    this.store.set(key, entry);

    // Check if over limit
    return entry.count > this.maxRequests;
  }

  // Get remaining requests for a key
  public getRemainingRequests(key: string): number {
    const entry = this.store.get(key);
    if (!entry) {
      return this.maxRequests;
    }

    if (Date.now() > entry.resetTime) {
      return this.maxRequests;
    }

    return Math.max(0, this.maxRequests - entry.count);
  }

  // Get reset time for a key
  public getResetTime(key: string): number {
    const entry = this.store.get(key);
    if (!entry) {
      return Date.now() + this.windowMs;
    }
    return entry.resetTime;
  }
}

// Create different rate limiters for different types of requests
const apiRateLimiter = new RateLimiter(100, 60000); // 100 requests per minute
const authRateLimiter = new RateLimiter(5, 60000);  // 5 auth requests per minute

// Rate limiting middleware
export function rateLimit(type: 'api' | 'auth' = 'api') {
  return (req: Request, res: Response, next: NextFunction) => {
    const limiter = type === 'auth' ? authRateLimiter : apiRateLimiter;
    
    // Use IP address as the key
    // In production, you might want to use a combination of IP and user ID if authenticated
    const key = req.ip || 'unknown';
    
    if (limiter.isRateLimited(key)) {
      const resetTime = limiter.getResetTime(key);
      res.setHeader('Retry-After', Math.ceil((resetTime - Date.now()) / 1000).toString());
      res.setHeader('X-RateLimit-Limit', type === 'auth' ? '5' : '100');
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
      
      return res.status(429).json({
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
      });
    }
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', type === 'auth' ? '5' : '100');
    res.setHeader('X-RateLimit-Remaining', limiter.getRemainingRequests(key).toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(limiter.getResetTime(key) / 1000).toString());
    
    next();
  };
}
