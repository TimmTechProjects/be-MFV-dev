# Rate Limiting Documentation

## Overview

Rate limiting has been implemented to protect public API endpoints from DoS (Denial of Service) attacks and abuse.

## Implementation

### Middleware

**File:** `src/middleware/rateLimiter.ts`

Two rate limiters are configured:

1. **publicApiLimiter** - General public endpoints
   - Limit: 100 requests per minute per IP
   - Applied to: Forum threads, posts, categories
   
2. **searchLimiter** - Expensive search operations
   - Limit: 30 requests per minute per IP
   - Applied to: Forum search, global search

### Protected Endpoints

#### Forum Routes (`/api/forum/*`)

Rate limited public endpoints:
- `GET /api/forum/categories` → publicApiLimiter (100/min)
- `GET /api/forum/threads` → publicApiLimiter (100/min)
- `GET /api/forum/threads/:id` → publicApiLimiter (100/min)
- `GET /api/forum/threads/:id/replies` → publicApiLimiter (100/min)
- `GET /api/forum/search` → searchLimiter (30/min)

Protected endpoints (require auth token):
- All POST, PUT, DELETE operations require verifyToken middleware
- Rate limiting applies BEFORE authentication

#### Post Routes (`/api/posts/*`)

Rate limited public endpoints:
- `GET /api/posts` → publicApiLimiter (100/min)
- `GET /api/posts/:id` → publicApiLimiter (100/min)
- `GET /api/posts/user/:username` → publicApiLimiter (100/min)
- `GET /api/posts/:id/comments` → publicApiLimiter (100/min)

Protected endpoints (require auth token):
- All POST, PUT, DELETE operations require verifyToken middleware

## Response Format

When rate limit is exceeded, the API returns:

**Status Code:** `429 Too Many Requests`

**Response Body:**
```json
{
  "error": "Too many requests from this IP, please try again later.",
  "retryAfter": "60 seconds"
}
```

**Headers:**
```
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 1707850200
```

## Testing

### Manual Testing

Test that rate limiting works:

```bash
# Test publicApiLimiter (101 requests should trigger limit)
for i in {1..101}; do
  curl "https://be-mfv-dev.onrender.com/api/forum/threads"
done

# Expected: 101st request returns 429 error
```

### Test searchLimiter:

```bash
# Test searchLimiter (31 requests should trigger limit)
for i in {1..31}; do
  curl "https://be-mfv-dev.onrender.com/api/forum/search?query=test"
done

# Expected: 31st request returns 429 error
```

### Verify Headers:

```bash
curl -I "https://be-mfv-dev.onrender.com/api/forum/threads"
```

Look for:
```
RateLimit-Limit: 100
RateLimit-Remaining: 99
RateLimit-Reset: <timestamp>
```

## Configuration

### Adjusting Limits

Edit `src/middleware/rateLimiter.ts`:

```typescript
export const publicApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // Change time window
  max: 100, // Change max requests
  // ...
});
```

### Adding to New Routes

Import and apply the limiter:

```typescript
import { publicApiLimiter, searchLimiter } from '../middleware/rateLimiter';

// Apply to route
router.get('/new-endpoint', publicApiLimiter, (req, res, next) => {
  // Handler
});
```

## Security Considerations

### Bypassing Rate Limits

- **Auth Required Routes:** Authenticated routes are NOT rate limited separately
  - Authenticated users share the public rate limit pool
  - Consider adding user-specific rate limits in future

- **IP-based Limiting:** Rate limits are per IP address
  - Works well for most use cases
  - Can be bypassed by changing IP (VPN, proxies)
  - Consider adding user-based limits for authenticated requests

### Recommendations

1. **Monitor Logs:** Watch for 429 errors in production
2. **Adjust Limits:** If legitimate users hit limits, increase thresholds
3. **User-based Limits:** Consider adding separate limits for authenticated users
4. **CDN/WAF:** Use Cloudflare or similar for additional DDoS protection

## Future Enhancements

- [ ] User-based rate limiting (separate from IP-based)
- [ ] Different limits for free vs premium users
- [ ] Redis-based rate limiting for distributed systems
- [ ] Exponential backoff for repeated violations
- [ ] Whitelist for trusted IPs (e.g., health checks)
- [ ] Rate limit metrics dashboard

## Dependencies

- **express-rate-limit** v7.x
  - Docs: https://github.com/express-rate-limit/express-rate-limit
  - Stable, well-maintained middleware
  - In-memory store (works for single-server deployment)

## Related Issues

- Issue #21: Add rate limiting to public API endpoints
