# Forums API Documentation

## Overview
Complete REST API for the FloralVault Forums system with categories, threads, replies, and moderation.

Base URL: `/api/forums`

---

## Authentication
Most endpoints require authentication via JWT Bearer token:
```
Authorization: Bearer <token>
```

---

## Endpoints

### Categories

#### Create Category (Admin Only)
```http
POST /api/forums/categories
```

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "General Discussion",
  "slug": "general-discussion",
  "description": "Talk about anything plant-related",
  "icon": "💬",
  "order": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cm...",
    "name": "General Discussion",
    "slug": "general-discussion",
    "description": "Talk about anything plant-related",
    "icon": "💬",
    "order": 1,
    "createdAt": "2026-02-12T...",
    "updatedAt": "2026-02-12T..."
  }
}
```

---

#### List Categories
```http
GET /api/forums/categories
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cm...",
      "name": "General Discussion",
      "slug": "general-discussion",
      "description": "Talk about anything plant-related",
      "icon": "💬",
      "order": 1,
      "_count": {
        "threads": 42
      }
    }
  ]
}
```

---

### Threads

#### Create Thread
```http
POST /api/forums/threads
```

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "title": "Best fertilizer for Monstera?",
  "content": "I've been growing Monsteras for a year...",
  "categoryId": "cm...",
  "tags": ["monstera", "fertilizer", "care"],
  "images": ["https://..."]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cm...",
    "title": "Best fertilizer for Monstera?",
    "slug": "best-fertilizer-for-monstera-1707728400000",
    "content": "I've been growing Monsteras...",
    "images": ["https://..."],
    "authorId": "user-123",
    "author": {
      "id": "user-123",
      "username": "plantenthusiast",
      "avatarUrl": "https://...",
      "essence": 1250
    },
    "categoryId": "cm...",
    "category": {
      "id": "cm...",
      "name": "Plant Care & Help",
      "slug": "plant-care-help"
    },
    "tags": ["monstera", "fertilizer", "care"],
    "isPinned": false,
    "isLocked": false,
    "viewCount": 0,
    "createdAt": "2026-02-12T...",
    "updatedAt": "2026-02-12T...",
    "lastReplyAt": null,
    "_count": {
      "replies": 0
    }
  }
}
```

---

#### List Threads
```http
GET /api/forums/threads?categoryId=<id>&sortBy=<sort>&limit=<limit>&offset=<offset>
```

**Query Parameters:**
- `categoryId` (optional): Filter by category
- `sortBy` (optional): `recent` (default), `popular`, or `replies`
- `limit` (optional): Number of results (default 20, max 50)
- `offset` (optional): Pagination offset (default 0)

**Response (200):**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id": "cm...",
      "title": "Welcome to FloralVault!",
      "slug": "welcome-to-floralvault",
      "content": "New here? Start by...",
      "images": [],
      "author": {
        "id": "admin",
        "username": "admin",
        "avatarUrl": "https://...",
        "essence": 9999
      },
      "category": {
        "id": "cm...",
        "name": "Announcements",
        "slug": "announcements"
      },
      "tags": ["welcome", "introduction"],
      "isPinned": true,
      "isLocked": false,
      "viewCount": 2341,
      "createdAt": "2026-01-15T...",
      "updatedAt": "2026-02-11T...",
      "lastReplyAt": "2026-02-11T14:20:00Z",
      "_count": {
        "replies": 148
      }
    }
  ]
}
```

---

#### Get Thread by ID
```http
GET /api/forums/threads/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "cm...",
    "title": "Best fertilizer for Monstera?",
    "slug": "best-fertilizer-for-monstera",
    "content": "I've been growing...",
    "images": ["https://..."],
    "author": {
      "id": "user-123",
      "username": "plantenthusiast",
      "avatarUrl": "https://...",
      "essence": 1250
    },
    "category": {
      "id": "cm...",
      "name": "Plant Care & Help",
      "slug": "plant-care-help"
    },
    "tags": ["monstera", "fertilizer"],
    "isPinned": false,
    "isLocked": false,
    "viewCount": 456,
    "replies": [
      {
        "id": "reply-1",
        "content": "I use balanced 20-20-20...",
        "images": [],
        "threadId": "cm...",
        "authorId": "user-456",
        "author": {
          "id": "user-456",
          "username": "fertilizerpro",
          "avatarUrl": "https://...",
          "essence": 3400
        },
        "parentId": null,
        "createdAt": "2026-02-11T...",
        "updatedAt": "2026-02-11T...",
        "_count": {
          "likes": 12,
          "replies": 3
        }
      }
    ],
    "createdAt": "2026-02-11T...",
    "updatedAt": "2026-02-11T...",
    "lastReplyAt": "2026-02-11T15:45:00Z",
    "_count": {
      "replies": 23
    }
  }
}
```

---

#### Update Thread
```http
PUT /api/forums/threads/:id
```

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "title": "Updated title",
  "content": "Updated content...",
  "tags": ["updated", "tags"],
  "images": ["https://..."]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated thread */ }
}
```

**Error (403):**
```json
{
  "error": "Not authorized to update this thread"
}
```

**Error (400):**
```json
{
  "error": "Thread is locked and cannot be edited"
}
```

---

#### Delete Thread
```http
DELETE /api/forums/threads/:id
```

**Headers:**
- `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Thread deleted successfully"
}
```

---

### Replies

#### Create Reply
```http
POST /api/forums/threads/:id/replies
```

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "content": "Great question! I use...",
  "parentId": "reply-xyz", // optional (for nested replies)
  "images": ["https://..."] // optional
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "reply-abc",
    "content": "Great question! I use...",
    "images": ["https://..."],
    "threadId": "cm...",
    "authorId": "user-123",
    "author": {
      "id": "user-123",
      "username": "helpfuluser",
      "avatarUrl": "https://...",
      "essence": 890
    },
    "parentId": "reply-xyz",
    "createdAt": "2026-02-12T...",
    "updatedAt": "2026-02-12T...",
    "_count": {
      "likes": 0,
      "replies": 0
    }
  }
}
```

**Error (404):**
```json
{
  "error": "Thread not found"
}
```

**Error (400):**
```json
{
  "error": "Thread is locked"
}
```

---

#### Update Reply
```http
PUT /api/forums/threads/:id/replies/:replyId
```

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "content": "Updated reply content...",
  "images": ["https://..."]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated reply */ }
}
```

---

#### Delete Reply
```http
DELETE /api/forums/threads/:id/replies/:replyId
```

**Headers:**
- `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Reply deleted successfully"
}
```

---

### Thread Actions

#### Pin Thread (Admin Only)
```http
POST /api/forums/threads/:id/pin
```

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "pin": true  // or false to unpin
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated thread */ }
}
```

---

#### Lock Thread (Admin Only)
```http
POST /api/forums/threads/:id/lock
```

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "lock": true  // or false to unlock
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated thread */ }
}
```

---

#### Subscribe to Thread
```http
POST /api/forums/threads/:id/subscribe
```

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "subscribe": true  // or false to unsubscribe
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Subscribed successfully"
}
```

---

### Search

#### Search Threads and Replies
```http
GET /api/forums/search?q=<query>&limit=<limit>
```

**Query Parameters:**
- `q` (required): Search query
- `limit` (optional): Number of results (default 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "threads": [
      {
        "id": "cm...",
        "title": "Monstera fertilizer tips",
        "content": "Here's what I learned...",
        "author": { /* author data */ },
        "category": { /* category data */ },
        "tags": ["monstera", "fertilizer"],
        "viewCount": 234,
        "createdAt": "2026-02-10T...",
        "_count": {
          "replies": 15
        }
      }
    ],
    "replies": [
      {
        "id": "reply-xyz",
        "content": "I agree about the fertilizer...",
        "author": { /* author data */ },
        "thread": {
          "id": "cm...",
          "title": "Plant care tips",
          "slug": "plant-care-tips"
        },
        "createdAt": "2026-02-11T..."
      }
    ]
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

**400 Bad Request:**
```json
{
  "error": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "error": "Not authorized to perform this action"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to perform action",
  "message": "Detailed error message"
}
```

---

## Legacy Endpoint

### Get Forum Posts (Old)
```http
GET /api/forum/posts?limit=7
```

This endpoint is maintained for backward compatibility with the frontend.

**Response (200):**
```json
{
  "success": true,
  "count": 7,
  "data": [ /* array of forum posts */ ]
}
```

---

## Notes

1. **Admin Endpoints**: Currently, pin, lock, and create category endpoints require authentication but don't enforce admin role. Admin middleware should be added.

2. **Thread Subscriptions**: Users can subscribe to threads to receive notifications (notification system not yet implemented).

3. **Nested Replies**: Replies can have a `parentId` for threading conversations.

4. **Images**: Image URLs are stored as arrays. Upload handling should use UploadThing service.

5. **Slugs**: Thread slugs are auto-generated from titles with timestamp appended for uniqueness.

6. **View Counting**: Thread views are automatically incremented when fetching thread details.

7. **Last Reply**: Thread `lastReplyAt` is automatically updated when replies are created.

8. **Pinned Threads**: Always appear first in thread listings regardless of sort order.

9. **Locked Threads**: Cannot be edited or receive new replies.

10. **Pagination**: Use `limit` and `offset` for paginating thread lists.

---

## Database Schema

See `src/prisma/schema.prisma` for complete schema with relationships and indexes.

### Models:
- `ForumCategory` - Forum categories
- `ForumThread` - Discussion threads
- `ForumReply` - Replies to threads (supports nesting)
- `Like` - Likes on replies

### Relationships:
- User → ForumThread (author)
- User → ForumReply (author)
- User → ForumThread (subscribers, many-to-many)
- ForumCategory → ForumThread (one-to-many)
- ForumThread → ForumReply (one-to-many)
- ForumReply → ForumReply (self-referencing for nested replies)
- ForumReply → Like (one-to-many)

---

## Seeded Categories

The database seeds these default categories:

1. **General Discussion** - Talk about anything plant-related
2. **Plant Care & Help** - Get help with your plants and share care tips
3. **Plant Identification** - Help identify plants and learn their names
4. **Show & Tell** - Show off your beautiful plants and collections
5. **Marketplace Discussion** - Discuss plant trades, sales, and marketplace
6. **Site Feedback** - Suggestions and feedback for FloralVault

---

## Testing

Use Postman, Insomnia, or curl to test endpoints:

```bash
# Get categories (no auth required)
curl http://localhost:5000/api/forums/categories

# Create thread (requires auth)
curl -X POST http://localhost:5000/api/forums/threads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Thread",
    "content": "This is a test",
    "categoryId": "CATEGORY_ID"
  }'

# Get threads
curl http://localhost:5000/api/forums/threads?sortBy=popular&limit=10

# Search
curl http://localhost:5000/api/forums/search?q=monstera
```

---

## Future Enhancements

- [ ] Admin role middleware
- [ ] Like/unlike replies endpoints
- [ ] Thread notifications for subscribers
- [ ] User reputation/karma system
- [ ] Markdown support in content
- [ ] Image upload integration
- [ ] Rate limiting
- [ ] Report/flag system
- [ ] User blocking
- [ ] Thread tagging system improvements
