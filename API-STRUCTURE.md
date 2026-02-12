# Forums API Structure

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FloralVault Forums API                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Express Server                           │
│                   (src/index.ts)                            │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │   Routes Layer    │
                    │ (forumRoutes.ts)  │
                    └─────────┬─────────┘
                              │
                    ┌─────────┴─────────┐
                    │  Middleware       │
                    │  - verifyToken    │
                    │  - (admin)        │
                    └─────────┬─────────┘
                              │
                    ┌─────────┴─────────┐
                    │  Controller       │
                    │ (forumController) │
                    └─────────┬─────────┘
                              │
                    ┌─────────┴─────────┐
                    │   Service         │
                    │ (forumService)    │
                    └─────────┬─────────┘
                              │
                    ┌─────────┴─────────┐
                    │   Prisma ORM      │
                    │   (Database)      │
                    └───────────────────┘
```

---

## 📂 File Structure

```
floralVault-backend/
│
├── src/
│   ├── index.ts                    # App entry, route mounting
│   │
│   ├── routes/
│   │   └── forumRoutes.ts          # 15+ route definitions
│   │
│   ├── controllers/
│   │   └── forumController.ts      # Request/response handlers
│   │
│   ├── services/
│   │   └── forumService.ts         # Business logic, DB operations
│   │
│   ├── middleware/
│   │   └── verifyToken.ts          # JWT authentication
│   │
│   └── prisma/
│       ├── schema.prisma           # Database schema (4 new models)
│       ├── seed.ts                 # Seed 6 categories
│       └── migrations/
│           └── 20260212063000_add_forums_system/
│               └── migration.sql   # Database migration
│
└── FORUMS-API.md                   # Complete API docs
```

---

## 🗄️ Database Schema

```
┌──────────────────┐
│  ForumCategory   │
├──────────────────┤
│ id (PK)          │
│ name (unique)    │
│ slug (unique)    │──┐
│ description      │  │
│ icon             │  │
│ order            │  │
│ createdAt        │  │
│ updatedAt        │  │
└──────────────────┘  │
                      │
        ┌─────────────┘
        │ 1:N
        ▼
┌──────────────────┐
│  ForumThread     │
├──────────────────┤
│ id (PK)          │
│ title            │
│ slug             │
│ content          │──┐
│ images[]         │  │
│ authorId (FK)    │──┼───────────┐
│ categoryId (FK)  │  │           │
│ isPinned         │  │           │
│ isLocked         │  │           │
│ viewCount        │  │           │
│ tags[]           │  │           │
│ createdAt        │  │           │
│ updatedAt        │  │           │
│ lastReplyAt      │  │           │
└──────────────────┘  │           │
                      │           │
        ┌─────────────┘           │
        │ 1:N                     │
        ▼                         │
┌──────────────────┐              │
│  ForumReply      │              │
├──────────────────┤              │
│ id (PK)          │              │
│ content          │              │
│ images[]         │              │
│ threadId (FK)    │              │
│ authorId (FK)    │──────────────┤
│ parentId (FK)    │──┐           │
│ createdAt        │  │           │
│ updatedAt        │  │           │
└──────────────────┘  │           │
        │              │           │
        │ Self-        │           │
        │ Reference    │           │
        │ (Nested)     │           │
        └──────────────┘           │
        │                          │
        │ 1:N                      │
        ▼                          │
┌──────────────────┐              │
│      Like        │              │
├──────────────────┤              │
│ id (PK)          │              │
│ userId (FK)      │──────────────┤
│ replyId (FK)     │              │
│ createdAt        │              │
└──────────────────┘              │
                                  │
        ┌─────────────────────────┘
        │ N:M (via _ThreadSubscriptions)
        ▼
┌──────────────────┐
│      User        │
├──────────────────┤
│ id (PK)          │
│ username         │
│ avatarUrl        │
│ essence          │
│ ...              │
└──────────────────┘
```

---

## 🛣️ API Endpoints Map

```
/api/forums
│
├── /categories
│   ├── GET     → List all categories (public)
│   └── POST    → Create category (admin)
│
├── /threads
│   ├── GET     → List threads (public, filters, sort, pagination)
│   ├── POST    → Create thread (auth)
│   │
│   └── /:id
│       ├── GET     → Get thread details + replies (public)
│       ├── PUT     → Update thread (auth, owner only)
│       ├── DELETE  → Delete thread (auth, owner only)
│       │
│       ├── /pin
│       │   └── POST → Pin/unpin thread (admin)
│       │
│       ├── /lock
│       │   └── POST → Lock/unlock thread (admin)
│       │
│       ├── /subscribe
│       │   └── POST → Subscribe/unsubscribe (auth)
│       │
│       └── /replies
│           ├── POST → Create reply (auth)
│           │
│           └── /:replyId
│               ├── PUT    → Update reply (auth, owner only)
│               └── DELETE → Delete reply (auth, owner only)
│
└── /search
    └── GET → Search threads & replies (public)

/api/forum
└── /posts (legacy)
    └── GET → List posts (backward compatibility)
```

---

## 🔄 Request Flow

### Creating a Thread

```
1. Client Request
   ↓
   POST /api/forums/threads
   Authorization: Bearer <JWT>
   Body: { title, content, categoryId, tags, images }
   ↓

2. Express Router (forumRoutes.ts)
   ↓
   Route: POST /threads
   ↓

3. Middleware (verifyToken)
   ↓
   Verify JWT → Extract userId → Attach to req.user
   ↓

4. Controller (forumController.createThread)
   ↓
   - Validate input (title, content, categoryId required)
   - Extract data from req.body
   - Extract userId from req.user
   ↓

5. Service (forumService.createThread)
   ↓
   - Generate slug from title + timestamp
   - Call Prisma to create thread
   - Include author and category data
   ↓

6. Prisma ORM
   ↓
   - Insert into ForumThread table
   - Return created record with relations
   ↓

7. Controller Response
   ↓
   {
     "success": true,
     "data": { thread object }
   }
   ↓

8. Client receives 201 Created
```

---

## 🔐 Authentication Flow

```
┌──────────────────┐
│   User Login     │
│  /api/auth/login │
└────────┬─────────┘
         │
         ▼
    Generate JWT
    (includes userId)
         │
         ▼
┌──────────────────┐
│  Client stores   │
│   JWT token      │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Subsequent requests include:    │
│  Authorization: Bearer <JWT>     │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────┐
│  verifyToken     │
│  middleware      │
└────────┬─────────┘
         │
    ┌────┴────┐
    │ Valid?  │
    └────┬────┘
    Yes  │  No
    │    └─────────→ 401 Unauthorized
    ▼
Extract userId
Attach to req.user
    │
    ▼
┌──────────────────┐
│   Controller     │
│ Uses req.user    │
└──────────────────┘
```

---

## 📊 Data Flow Example

### Thread Listing with Replies

```
Client Request:
GET /api/forums/threads/cm5abc...

↓

forumService.getThreadById()
↓
Prisma Query:
{
  findUnique: {
    where: { id: "cm5abc..." },
    include: {
      author: { select: { id, username, avatarUrl, essence } },
      category: { select: { id, name, slug } },
      replies: {
        include: {
          author: { select: { id, username, avatarUrl, essence } },
          _count: { select: { likes, replies } }
        },
        orderBy: { createdAt: "asc" }
      },
      _count: { select: { replies } }
    }
  }
}

↓

Database Returns:
{
  thread: { ... },
  author: { ... },
  category: { ... },
  replies: [
    {
      id: "reply-1",
      author: { ... },
      _count: { likes: 5, replies: 2 },
      replies: null  // Not included in this query
    },
    {
      id: "reply-2",
      author: { ... },
      _count: { likes: 3, replies: 0 },
      replies: null
    }
  ]
}

↓

Auto-increment viewCount
(separate update query)

↓

Response to Client:
{
  "success": true,
  "data": {
    "id": "cm5abc...",
    "title": "...",
    "author": { ... },
    "category": { ... },
    "replies": [ ... ],
    "viewCount": 457,  // Incremented
    "_count": { "replies": 23 }
  }
}
```

---

## 🎯 Feature Implementation Map

```
┌─────────────────────────────────────────┐
│           Core Features                  │
├─────────────────────────────────────────┤
│                                          │
│  ✅ CRUD Operations                     │
│     └─ Create/Read/Update/Delete        │
│        threads and replies               │
│                                          │
│  ✅ Authentication                       │
│     └─ JWT token verification           │
│                                          │
│  ✅ Authorization                        │
│     └─ Owner-only edit/delete           │
│                                          │
│  ✅ Nested Replies                       │
│     └─ Parent/child relationships       │
│                                          │
│  ✅ Thread Pinning                       │
│     └─ Pinned always appear first       │
│                                          │
│  ✅ Thread Locking                       │
│     └─ Prevent edits/replies            │
│                                          │
│  ✅ Subscriptions                        │
│     └─ Users follow threads             │
│                                          │
│  ✅ View Counting                        │
│     └─ Auto-increment on view           │
│                                          │
│  ✅ Search                               │
│     └─ Full-text across content/tags    │
│                                          │
│  ✅ Pagination                           │
│     └─ Limit/offset support             │
│                                          │
│  ✅ Sorting                              │
│     └─ Recent/popular/replies           │
│                                          │
└─────────────────────────────────────────┘
```

---

## 🧩 Component Interaction

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│   Database   │
│   (React)    │     │   (Express)  │     │ (PostgreSQL) │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                     │
       │  HTTP Requests     │  Prisma Queries    │
       │  (REST API)        │  (ORM)             │
       │                    │                     │
       ├─ POST /threads     ├─ prisma.thread     │
       ├─ GET /threads      │   .create()         │
       ├─ GET /threads/:id  ├─ prisma.thread     │
       ├─ POST /replies     │   .findMany()       │
       └─ GET /search       └─ prisma.thread     │
                                .findUnique()     │
                                                 │
       ┌────────────────────────────────────────┘
       │
       ▼
┌──────────────────┐
│  Tables:         │
│  - ForumCategory │
│  - ForumThread   │
│  - ForumReply    │
│  - Like          │
│  - User          │
└──────────────────┘
```

---

## 📈 Performance Optimizations

```
Indexes Added:
├── ForumCategory
│   ├── slug (unique)
│   └── order
│
├── ForumThread
│   ├── categoryId
│   ├── authorId
│   ├── slug
│   └── [isPinned, createdAt] (composite)
│
├── ForumReply
│   ├── threadId
│   └── authorId
│
└── Like
    ├── [userId, replyId] (unique composite)
    ├── userId
    └── replyId

Query Optimizations:
├── Selective field inclusion (only needed data)
├── Separate pinned/regular queries (better performance)
├── Pagination support (limit results)
├── View count updated asynchronously (non-blocking)
└── Proper foreign key constraints (referential integrity)
```

---

## 🚀 Deployment Flow

```
1. Code Push to GitHub
   └─ Branch: feature/forums-backend-api-issue-2
   
2. Create Pull Request
   └─ Review changes
   
3. Merge to main
   
4. Render Auto-Deploy Triggers
   
5. Build Process:
   ├─ npm install
   ├─ npx prisma generate (creates Prisma client)
   ├─ npx prisma db push (applies migration)
   └─ npm run build (compiles TypeScript)
   
6. Seed Database:
   └─ npm run seed (creates 6 categories)
   
7. Start Server:
   └─ npm start
   
8. API Live! 🎉
   └─ https://floral-vault-api.onrender.com/api/forums/...
```

---

## 🧪 Testing Workflow

```
1. Get Categories (Public)
   ↓
   GET /api/forums/categories
   ↓
   Verify: 6 categories returned

2. Create Thread (Auth Required)
   ↓
   POST /api/forums/threads
   Authorization: Bearer <token>
   ↓
   Verify: Thread created with author/category

3. List Threads (Public)
   ↓
   GET /api/forums/threads
   ↓
   Verify: Thread appears in list

4. View Thread (Public)
   ↓
   GET /api/forums/threads/:id
   ↓
   Verify: Details shown, view count incremented

5. Add Reply (Auth Required)
   ↓
   POST /api/forums/threads/:id/replies
   ↓
   Verify: Reply created, thread.lastReplyAt updated

6. Search (Public)
   ↓
   GET /api/forums/search?q=keyword
   ↓
   Verify: Matching threads and replies found

7. Pin Thread (Admin)
   ↓
   POST /api/forums/threads/:id/pin
   ↓
   Verify: isPinned=true, appears first in lists

8. Lock Thread (Admin)
   ↓
   POST /api/forums/threads/:id/lock
   ↓
   Verify: isLocked=true, new replies rejected
```

---

## ✅ Status

```
Schema:       ✅ Complete
Migration:    ✅ Created
Seed:         ✅ Ready
Service:      ✅ Implemented
Controller:   ✅ Implemented
Routes:       ✅ Configured
Tests:        ⏳ Pending deployment
Docs:         ✅ Complete
PR:           ⏳ Ready to create
Deploy:       ⏳ Ready to merge
```

---

**All systems ready for deployment!** 🚀
