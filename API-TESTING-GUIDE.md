# Forums API Testing Guide

## 🚀 Quick Start

After deployment, test these endpoints to verify the forums system:

---

## 1️⃣ Get Categories (Public)

### Request
```http
GET https://floral-vault-api.onrender.com/api/forums/categories
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "cm1...",
      "name": "General Discussion",
      "slug": "general-discussion",
      "description": "Talk about anything plant-related",
      "icon": "💬",
      "order": 1,
      "createdAt": "2026-02-12T06:30:00.000Z",
      "updatedAt": "2026-02-12T06:30:00.000Z",
      "_count": {
        "threads": 0
      }
    },
    {
      "id": "cm2...",
      "name": "Plant Care & Help",
      "slug": "plant-care-help",
      "description": "Get help with your plants and share care tips",
      "icon": "🌱",
      "order": 2,
      "createdAt": "2026-02-12T06:30:00.000Z",
      "updatedAt": "2026-02-12T06:30:00.000Z",
      "_count": {
        "threads": 0
      }
    }
    // ... 4 more categories
  ]
}
```

**✅ Success Indicators:**
- Status: 200
- Array of 6 categories
- Each has id, name, slug, icon
- Thread counts initially 0

---

## 2️⃣ Create Thread (Authenticated)

### Request
```http
POST https://floral-vault-api.onrender.com/api/forums/threads
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Best fertilizer for Monstera deliciosa?",
  "content": "I've been growing Monsteras for about a year now and I'm looking to optimize my fertilizing routine. What do you all recommend? I've heard mixed things about using worm castings vs. synthetic fertilizers.",
  "categoryId": "cm2...",
  "tags": ["monstera", "fertilizer", "care-tips"],
  "images": [
    "https://utfs.io/f/abc123.jpg"
  ]
}
```

### Expected Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "cm5abc...",
    "title": "Best fertilizer for Monstera deliciosa?",
    "slug": "best-fertilizer-for-monstera-deliciosa-1707728400000",
    "content": "I've been growing Monsteras for about a year now...",
    "images": [
      "https://utfs.io/f/abc123.jpg"
    ],
    "authorId": "user-888",
    "author": {
      "id": "user-888",
      "username": "test",
      "avatarUrl": "https://i.pravatar.cc/150?img=33",
      "essence": 1000
    },
    "categoryId": "cm2...",
    "category": {
      "id": "cm2...",
      "name": "Plant Care & Help",
      "slug": "plant-care-help"
    },
    "tags": ["monstera", "fertilizer", "care-tips"],
    "isPinned": false,
    "isLocked": false,
    "viewCount": 0,
    "createdAt": "2026-02-12T06:35:00.000Z",
    "updatedAt": "2026-02-12T06:35:00.000Z",
    "lastReplyAt": null,
    "_count": {
      "replies": 0
    }
  }
}
```

**✅ Success Indicators:**
- Status: 201
- Thread created with auto-generated slug
- Author info populated
- Category info populated
- Tags array preserved
- Initial counts: 0 views, 0 replies

---

## 3️⃣ Get Threads (Public)

### Request
```http
GET https://floral-vault-api.onrender.com/api/forums/threads?limit=10
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "cm5abc...",
      "title": "Best fertilizer for Monstera deliciosa?",
      "slug": "best-fertilizer-for-monstera-deliciosa-1707728400000",
      "content": "I've been growing Monsteras for about a year now...",
      "images": ["https://utfs.io/f/abc123.jpg"],
      "author": {
        "id": "user-888",
        "username": "test",
        "avatarUrl": "https://i.pravatar.cc/150?img=33",
        "essence": 1000
      },
      "category": {
        "id": "cm2...",
        "name": "Plant Care & Help",
        "slug": "plant-care-help"
      },
      "tags": ["monstera", "fertilizer", "care-tips"],
      "isPinned": false,
      "isLocked": false,
      "viewCount": 0,
      "createdAt": "2026-02-12T06:35:00.000Z",
      "updatedAt": "2026-02-12T06:35:00.000Z",
      "lastReplyAt": null,
      "_count": {
        "replies": 0
      }
    }
  ]
}
```

**✅ Success Indicators:**
- Status: 200
- Array of threads
- Each thread has author, category
- Pinned threads appear first

---

## 4️⃣ Get Single Thread (Public)

### Request
```http
GET https://floral-vault-api.onrender.com/api/forums/threads/cm5abc...
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "cm5abc...",
    "title": "Best fertilizer for Monstera deliciosa?",
    "slug": "best-fertilizer-for-monstera-deliciosa-1707728400000",
    "content": "I've been growing Monsteras for about a year now...",
    "images": ["https://utfs.io/f/abc123.jpg"],
    "author": {
      "id": "user-888",
      "username": "test",
      "avatarUrl": "https://i.pravatar.cc/150?img=33",
      "essence": 1000
    },
    "category": {
      "id": "cm2...",
      "name": "Plant Care & Help",
      "slug": "plant-care-help"
    },
    "tags": ["monstera", "fertilizer", "care-tips"],
    "isPinned": false,
    "isLocked": false,
    "viewCount": 1,
    "replies": [],
    "createdAt": "2026-02-12T06:35:00.000Z",
    "updatedAt": "2026-02-12T06:35:00.000Z",
    "lastReplyAt": null,
    "_count": {
      "replies": 0
    }
  }
}
```

**✅ Success Indicators:**
- Status: 200
- Full thread data with replies array
- View count incremented automatically
- Empty replies array initially

---

## 5️⃣ Create Reply (Authenticated)

### Request
```http
POST https://floral-vault-api.onrender.com/api/forums/threads/cm5abc.../replies
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "content": "I've had great success with a balanced 20-20-20 liquid fertilizer diluted to half strength. I apply it once a month during growing season (spring/summer) and reduce to every 6-8 weeks in fall/winter. The key is not to over-fertilize!"
}
```

### Expected Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "reply-xyz123",
    "content": "I've had great success with a balanced 20-20-20 liquid fertilizer...",
    "images": [],
    "threadId": "cm5abc...",
    "authorId": "user-104",
    "author": {
      "id": "user-104",
      "username": "jominime",
      "avatarUrl": "https://static.myfigurecollection.net/upload/users/200/216069_1617412905.jpeg",
      "essence": 2500
    },
    "parentId": null,
    "createdAt": "2026-02-12T06:40:00.000Z",
    "updatedAt": "2026-02-12T06:40:00.000Z",
    "_count": {
      "likes": 0,
      "replies": 0
    }
  }
}
```

**✅ Success Indicators:**
- Status: 201
- Reply created with author info
- parentId null (top-level reply)
- Initial likes count: 0

---

## 6️⃣ Create Nested Reply (Authenticated)

### Request
```http
POST https://floral-vault-api.onrender.com/api/forums/threads/cm5abc.../replies
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "content": "Thanks for the tip! Do you use liquid or granular?",
  "parentId": "reply-xyz123"
}
```

### Expected Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "reply-abc456",
    "content": "Thanks for the tip! Do you use liquid or granular?",
    "images": [],
    "threadId": "cm5abc...",
    "authorId": "user-888",
    "author": {
      "id": "user-888",
      "username": "test",
      "avatarUrl": "https://i.pravatar.cc/150?img=33",
      "essence": 1000
    },
    "parentId": "reply-xyz123",
    "createdAt": "2026-02-12T06:42:00.000Z",
    "updatedAt": "2026-02-12T06:42:00.000Z",
    "_count": {
      "likes": 0,
      "replies": 0
    }
  }
}
```

**✅ Success Indicators:**
- Status: 201
- parentId points to parent reply
- Nested reply structure works

---

## 7️⃣ Pin Thread (Admin)

### Request
```http
POST https://floral-vault-api.onrender.com/api/forums/threads/cm5abc.../pin
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "pin": true
}
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "cm5abc...",
    "title": "Best fertilizer for Monstera deliciosa?",
    "slug": "best-fertilizer-for-monstera-deliciosa-1707728400000",
    "content": "I've been growing Monsteras for about a year now...",
    "images": ["https://utfs.io/f/abc123.jpg"],
    "authorId": "user-888",
    "categoryId": "cm2...",
    "isPinned": true,
    "isLocked": false,
    "viewCount": 5,
    "tags": ["monstera", "fertilizer", "care-tips"],
    "createdAt": "2026-02-12T06:35:00.000Z",
    "updatedAt": "2026-02-12T06:45:00.000Z",
    "lastReplyAt": "2026-02-12T06:42:00.000Z"
  }
}
```

**✅ Success Indicators:**
- Status: 200
- isPinned: true
- Thread will now appear first in listings

---

## 8️⃣ Lock Thread (Admin)

### Request
```http
POST https://floral-vault-api.onrender.com/api/forums/threads/cm5abc.../lock
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "lock": true
}
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "cm5abc...",
    "title": "Best fertilizer for Monstera deliciosa?",
    "isLocked": true,
    // ... other fields
  }
}
```

**✅ Success Indicators:**
- Status: 200
- isLocked: true
- No new replies can be added
- No edits allowed

---

## 9️⃣ Subscribe to Thread (Authenticated)

### Request
```http
POST https://floral-vault-api.onrender.com/api/forums/threads/cm5abc.../subscribe
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "subscribe": true
}
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "message": "Subscribed successfully"
}
```

**✅ Success Indicators:**
- Status: 200
- User added to thread subscribers
- Ready for future notifications

---

## 🔟 Search (Public)

### Request
```http
GET https://floral-vault-api.onrender.com/api/forums/search?q=monstera&limit=10
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "data": {
    "threads": [
      {
        "id": "cm5abc...",
        "title": "Best fertilizer for Monstera deliciosa?",
        "content": "I've been growing Monsteras for about a year now...",
        "author": {
          "id": "user-888",
          "username": "test",
          "avatarUrl": "https://i.pravatar.cc/150?img=33",
          "essence": 1000
        },
        "category": {
          "id": "cm2...",
          "name": "Plant Care & Help",
          "slug": "plant-care-help"
        },
        "tags": ["monstera", "fertilizer", "care-tips"],
        "viewCount": 5,
        "createdAt": "2026-02-12T06:35:00.000Z",
        "_count": {
          "replies": 2
        }
      }
    ],
    "replies": [
      {
        "id": "reply-xyz123",
        "content": "I've had great success with a balanced 20-20-20 liquid fertilizer...",
        "author": {
          "id": "user-104",
          "username": "jominime",
          "avatarUrl": "https://...",
          "essence": 2500
        },
        "thread": {
          "id": "cm5abc...",
          "title": "Best fertilizer for Monstera deliciosa?",
          "slug": "best-fertilizer-for-monstera-deliciosa-1707728400000"
        },
        "createdAt": "2026-02-12T06:40:00.000Z"
      }
    ]
  }
}
```

**✅ Success Indicators:**
- Status: 200
- Separate arrays for threads and replies
- Search matches in title, content, and tags
- Results sorted by relevance

---

## 🧪 Error Cases to Test

### 1. Unauthorized (No Token)
```http
POST /api/forums/threads
# No Authorization header

Response: 401 Unauthorized
{
  "error": "Unauthorized"
}
```

### 2. Not Found
```http
GET /api/forums/threads/invalid-id

Response: 404 Not Found
{
  "error": "Thread not found"
}
```

### 3. Permission Denied
```http
PUT /api/forums/threads/someone-elses-thread-id
Authorization: Bearer YOUR_JWT_TOKEN

Response: 403 Forbidden
{
  "error": "Not authorized to update this thread"
}
```

### 4. Locked Thread
```http
POST /api/forums/threads/locked-thread-id/replies
Authorization: Bearer YOUR_JWT_TOKEN

Response: 400 Bad Request
{
  "error": "Thread is locked"
}
```

### 5. Validation Error
```http
POST /api/forums/threads
Authorization: Bearer YOUR_JWT_TOKEN
{
  "title": "Test"
  // Missing required fields
}

Response: 400 Bad Request
{
  "error": "Title, content, and categoryId are required"
}
```

---

## 🎯 Complete Test Flow

1. **GET /api/forums/categories** → Should return 6 categories
2. **POST /api/forums/threads** → Create a thread in category 1
3. **GET /api/forums/threads** → Should show new thread
4. **GET /api/forums/threads/:id** → Should show thread details (viewCount +1)
5. **POST /api/forums/threads/:id/replies** → Add a reply
6. **GET /api/forums/threads/:id** → Should show thread with 1 reply
7. **POST /api/forums/threads/:id/replies** → Add nested reply (with parentId)
8. **GET /api/forums/threads/:id** → Should show nested structure
9. **POST /api/forums/threads/:id/subscribe** → Subscribe to thread
10. **GET /api/forums/search?q=<keyword>** → Should find the thread

---

## 📊 Expected Database State After Tests

```
ForumCategory: 6 records (from seed)
ForumThread: 1+ records (from tests)
ForumReply: 2+ records (from tests)
Like: 0 records (not tested yet)
_ThreadSubscriptions: 1+ records (from subscribe test)
```

---

## 🔧 Testing Tools

### Option 1: cURL (Command Line)
```bash
# Get categories
curl https://floral-vault-api.onrender.com/api/forums/categories

# Create thread (with auth)
curl -X POST https://floral-vault-api.onrender.com/api/forums/threads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Test content","categoryId":"cm..."}'
```

### Option 2: Postman
1. Import endpoints from FORUMS-API.md
2. Set Authorization header with JWT token
3. Test each endpoint
4. Verify response format

### Option 3: Insomnia
1. Create new request collection
2. Add environment variable for base URL
3. Add JWT token to environment
4. Test endpoints sequentially

### Option 4: REST Client (VS Code)
Create `forums.http` file:
```http
@baseUrl = https://floral-vault-api.onrender.com
@token = YOUR_JWT_TOKEN

### Get Categories
GET {{baseUrl}}/api/forums/categories

### Create Thread
POST {{baseUrl}}/api/forums/threads
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "title": "Test Thread",
  "content": "Test content",
  "categoryId": "cm..."
}
```

---

## ✅ Success Criteria

After deployment and testing, verify:

- [ ] All 6 categories seeded correctly
- [ ] Can create threads with authentication
- [ ] Can list threads (public)
- [ ] Can view single thread (public, increments views)
- [ ] Can create replies (authentication required)
- [ ] Can create nested replies (parentId works)
- [ ] Can edit own threads
- [ ] Cannot edit others' threads (403)
- [ ] Can delete own threads
- [ ] Cannot delete others' threads (403)
- [ ] Can pin threads (admin)
- [ ] Can lock threads (admin)
- [ ] Locked threads reject new replies
- [ ] Can subscribe to threads
- [ ] Search finds matching threads and replies
- [ ] Pinned threads appear first in listings
- [ ] View counts increment on thread view
- [ ] lastReplyAt updates when reply added

---

**Ready for deployment and testing!** 🚀
