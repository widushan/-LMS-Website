# 2. Architectural Design – LMS Website

## 2.1 System Architecture Overview

The LMS Website follows a **3-tier client-server architecture** with clear separation between presentation, business logic, and data layers. The system integrates multiple external services (Clerk for authentication, Stripe for payments, Cloudinary for media storage) through well-defined APIs and webhooks.

### Architecture Pattern
- **Primary Pattern**: Layered Architecture (Presentation → Application → Data)
- **Deployment Model**: Monolithic backend (Express.js) with separate React frontend
- **Integration Style**: RESTful APIs + Webhooks for external services

---

## 2.2 High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                             │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  React Frontend (Vite)                                    │ │
│  │  - Student Pages (Home, CourseList, CourseDetails, etc.)  │ │
│  │  - Educator Pages (Dashboard, AddCourse, MyCourses, etc.) │ │
│  │  - Shared Components (Navbar, Footer, CourseCard, etc.)  │ │
│  │  - Context/State Management (AppContext)                  │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST API
                              │ (Axios)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION TIER                            │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Express.js Backend Server                               │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │ │
│  │  │   Routes     │  │ Controllers  │  │ Middlewares │  │ │
│  │  │ - /api/user  │  │ - userCtrl   │  │ - auth       │  │ │
│  │  │ - /api/course│  │ - courseCtrl │  │ - multer     │  │ │
│  │  │ - /api/educ  │  │ - educCtrl   │  │              │  │ │
│  │  │ - /clerk     │  │ - webhooks   │  │              │  │ │
│  │  │ - /stripe    │  │              │  │              │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
         │              │              │              │
         │              │              │              │
         ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   MongoDB    │ │   Clerk      │ │   Stripe     │ │  Cloudinary │
│   Database   │ │   (Auth)     │ │   (Payments) │ │   (Media)   │
│              │ │              │ │              │ │             │
│ - Users      │ │ - JWT Auth   │ │ - Checkout   │ │ - Images    │
│ - Courses    │ │ - Webhooks   │ │ - Webhooks   │ │ - Thumbnails│
│ - Purchases  │ │              │ │              │ │             │
│ - Progress   │ │              │ │              │ │             │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

---

## 2.3 Subsystem Decomposition

### 2.3.1 Frontend Subsystem (Client)

**Purpose**: User interface and client-side logic for students and educators.

**Components**:
- **Presentation Layer** (`pages/`)
  - Student Pages: `Home`, `CoursesList`, `CourseDetails`, `MyEnrollments`, `Player`
  - Educator Pages: `Educator`, `Dashboard`, `AddCourse`, `MyCourses`, `StudentsEnrolled`
- **UI Components** (`components/`)
  - Student: `Navbar`, `Footer`, `CourseCard`, `SearchBar`, `Rating`, `Hero`, etc.
  - Educator: `Sidebar`, `Footer`, `Navbar`
- **State Management** (`context/AppContext.jsx`)
  - Global state: `allCourses`, `enrolledCourses`, `userData`, `isEducator`
  - Helper functions: `calculateRating`, `calculateCourseDuration`, `fetchAllCourses`, etc.
- **Routing** (`App.jsx`)
  - React Router configuration for all routes
  - Conditional rendering based on educator routes

**Technologies**: React 19, React Router, Axios, TailwindCSS, Vite

---

### 2.3.2 Backend Subsystem (Server)

**Purpose**: Business logic, API endpoints, and integration with external services.

**Components**:
- **Route Layer** (`routes/`)
  - `userRoutes.js`: `/api/user/*` endpoints
  - `courseRoutes.js`: `/api/course/*` endpoints
  - `educatorRoutes.js`: `/api/educator/*` endpoints
- **Controller Layer** (`controllers/`)
  - `userController.js`: User data, enrollment, progress, ratings
  - `courseController.js`: Course listing and details
  - `educatorController.js`: Course creation, dashboard, student lists
  - `webhooks.js`: Clerk and Stripe webhook handlers
- **Middleware Layer** (`middlewares/`)
  - `authMiddleware.js`: Educator role protection (`protectEducator`)
- **Configuration Layer** (`configs/`)
  - `mongodb.js`: MongoDB connection
  - `cloudinary.js`: Cloudinary initialization
  - `multer.js`: File upload configuration

**Technologies**: Express.js 5, Mongoose, Clerk Express SDK, Stripe SDK, Multer

---

### 2.3.3 Data Subsystem

**Purpose**: Persistent storage for application data.

**Components**:
- **Data Models** (`models/`)
  - `User.js`: User profile, enrolled courses array
  - `Course.js`: Course metadata, content structure, ratings, enrolled students
  - `Purchase.js`: Purchase transactions (courseId, userId, amount, status)
  - `CourseProgress.js`: User progress per course (lectureCompleted array)

**Database**: MongoDB (NoSQL document store)

**Schema Relationships**:
- `User.enrolledCourses` → references `Course._id`
- `Course.enrolledStudents` → references `User._id`
- `Purchase.courseId` → references `Course._id`
- `Purchase.userId` → references `User._id`
- `CourseProgress.courseId` → references `Course._id` (string)

---

### 2.3.4 External Service Integration Subsystem

**Purpose**: Integration with third-party services for authentication, payments, and media.

**Components**:
- **Clerk Integration**
  - Authentication: JWT token generation and validation via `@clerk/express`
  - Webhooks: User lifecycle events (`user.created`, `user.updated`, `user.deleted`)
  - Endpoint: `POST /clerk`
- **Stripe Integration**
  - Payment Processing: Checkout session creation in `purchaseCourse`
  - Webhooks: Payment status updates (`payment_intent.succeeded`, `payment_intent.payment_failed`)
  - Endpoint: `POST /stripe`
- **Cloudinary Integration**
  - Media Storage: Course thumbnail uploads
  - Configuration: Initialized in `configs/cloudinary.js`

---

## 2.4 Layered Architecture View

### Layer 1: Presentation Layer (Client)

**Responsibilities**:
- Render UI components
- Handle user interactions
- Manage client-side routing
- Display data from API responses

**Key Files**:
- `client/src/pages/**/*.jsx`
- `client/src/components/**/*.jsx`
- `client/src/App.jsx`

**Dependencies**: React, React Router, TailwindCSS

---

### Layer 2: Application/Service Layer (Server)

**Responsibilities**:
- Process business logic
- Validate requests
- Coordinate between data layer and external services
- Transform data for presentation

**Key Files**:
- `server/controllers/*.js`
- `server/routes/*.js`
- `server/middlewares/*.js`

**Dependencies**: Express.js, Mongoose, Clerk SDK, Stripe SDK

---

### Layer 3: Data Access Layer

**Responsibilities**:
- Database operations (CRUD)
- Data model definitions
- Query optimization

**Key Files**:
- `server/models/*.js`
- `server/configs/mongodb.js`

**Dependencies**: Mongoose, MongoDB

---

### Layer 4: External Services Layer

**Responsibilities**:
- Integrate with Clerk, Stripe, Cloudinary
- Handle webhook events
- Manage API keys and configurations

**Key Files**:
- `server/controllers/webhooks.js`
- `server/configs/cloudinary.js`
- `server/configs/multer.js`

**Dependencies**: Clerk SDK, Stripe SDK, Cloudinary SDK, Svix (webhook verification)

---

## 2.5 Component Diagrams

### 2.5.1 Frontend Component Structure

```
App (Root)
├── ToastContainer (Global notifications)
├── Navbar (Conditional rendering)
└── Routes
    ├── Student Routes
    │   ├── Home
    │   │   ├── Hero
    │   │   ├── Companies
    │   │   ├── CoursesSection
    │   │   ├── TestimonialsSection
    │   │   ├── CallToAction
    │   │   └── Footer
    │   ├── CoursesList
    │   │   ├── SearchBar
    │   │   └── CourseCard (multiple)
    │   ├── CourseDetails
    │   │   └── YouTube (preview)
    │   ├── MyEnrollments
    │   │   └── Line (progress bars)
    │   └── Player
    │       ├── YouTube (lecture)
    │       └── Rating
    └── Educator Routes
        └── Educator (Layout)
            ├── Sidebar
            ├── Dashboard
            ├── AddCourse
            ├── MyCourses
            └── StudentsEnrolled

AppContext (Global State)
├── allCourses
├── enrolledCourses
├── userData
├── isEducator
└── Helper Functions
```

---

### 2.5.2 Backend Component Structure

```
Express App (server.js)
├── Middleware Stack
│   ├── CORS
│   ├── Clerk Middleware (auth)
│   └── JSON Parser
├── Route Handlers
│   ├── /api/user/*
│   │   └── userController
│   │       ├── getUserData
│   │       ├── userEnrolledCourses
│   │       ├── purchaseCourse
│   │       ├── updateUserCourseProgress
│   │       ├── getUserCourseProgress
│   │       └── addUserRating
│   ├── /api/course/*
│   │   └── courseController
│   │       ├── getAllCourse
│   │       └── getCourseId
│   ├── /api/educator/*
│   │   └── educatorController (protected)
│   │       ├── updateRoleToEducator
│   │       ├── addCourse
│   │       ├── getEducatorCourses
│   │       ├── educatorDashboardData
│   │       └── getEnrolledStudentsData
│   ├── /clerk (webhook)
│   │   └── clerkWebhooks
│   └── /stripe (webhook)
│       └── stripeWebhooks
└── Data Access Layer
    ├── User Model
    ├── Course Model
    ├── Purchase Model
    └── CourseProgress Model
```

---

## 2.6 Data Flow Diagrams

### 2.6.1 Course Purchase Flow

```
[Student Browser]
    │
    │ 1. Click "Enroll Now"
    ▼
[CourseDetails Component]
    │
    │ 2. POST /api/user/purchase (with courseId)
    ▼
[userController.purchaseCourse]
    │
    │ 3. Create Purchase document (status: pending)
    │ 4. Create Stripe Checkout Session
    ▼
[Stripe Checkout Page]
    │
    │ 5. User completes payment
    ▼
[Stripe Webhook]
    │
    │ 6. POST /stripe (payment_intent.succeeded)
    ▼
[stripeWebhooks Handler]
    │
    │ 7. Update Purchase.status = 'completed'
    │ 8. Add courseId to User.enrolledCourses
    │ 9. Add userId to Course.enrolledStudents
    ▼
[Student Browser]
    │
    │ 10. Redirect to /my-enrollements
    ▼
[MyEnrollments Page]
    │
    │ 11. Display enrolled course
```

---

### 2.6.2 Course Creation Flow

```
[Educator Browser]
    │
    │ 1. Fill AddCourse form
    │ 2. Upload thumbnail
    │ 3. Submit form
    ▼
[AddCourse Component]
    │
    │ 4. POST /api/educator/add-course
    │    (multipart/form-data: courseData JSON + image)
    ▼
[educatorController.addCourse]
    │
    │ 5. Validate educator role (protectEducator)
    │ 6. Parse courseData JSON
    │ 7. Upload image to Cloudinary
    │ 8. Create Course document in MongoDB
    ▼
[MongoDB]
    │
    │ 9. Course saved with thumbnail URL
    ▼
[Educator Browser]
    │
    │ 10. Success toast
    │ 11. Course appears in MyCourses
```

---

## 2.7 Improved Architecture Recommendations

### 2.7.1 Current Architecture Strengths
- ✅ Clear separation between frontend and backend
- ✅ RESTful API design
- ✅ Modular component structure
- ✅ Integration with external services via webhooks
- ✅ Middleware-based authentication

### 2.7.2 Suggested Improvements

**1. Microservices Migration (Future)**
```
Current: Monolithic Backend
    ↓
Proposed: Microservices
    ├── User Service (auth, profile, enrollment)
    ├── Course Service (CRUD, search, content)
    ├── Payment Service (Stripe integration)
    └── Progress Service (tracking, analytics)
```

**2. API Gateway Pattern**
- Introduce an API Gateway to handle:
  - Rate limiting
  - Request routing
  - Authentication/authorization centralization
  - API versioning

**3. Caching Layer**
- Add Redis for:
  - Course list caching
  - User session management
  - Frequently accessed data

**4. Message Queue for Webhooks**
- Use RabbitMQ or AWS SQS for:
  - Asynchronous webhook processing
  - Retry mechanisms
  - Better reliability

**5. Database Optimization**
- Add indexes on frequently queried fields:
  - `Course.isPublished`
  - `Purchase.userId`, `Purchase.courseId`
  - `CourseProgress.userId`, `CourseProgress.courseId`

**6. Error Handling & Logging**
- Centralized error handling middleware
- Structured logging (Winston/Pino)
- Error tracking (Sentry)

**7. API Documentation**
- Implement Swagger/OpenAPI documentation
- Auto-generate API docs from route definitions

---

## 2.8 Deployment Architecture

### Current Deployment (Development)
```
┌─────────────────┐         ┌─────────────────┐
│  React Dev      │         │  Express Dev    │
│  (Vite)         │────────▶│  (Node.js)      │
│  localhost:5173 │         │  localhost:5000 │
└─────────────────┘         └─────────────────┘
                                      │
                                      ▼
                            ┌─────────────────┐
                            │   MongoDB       │
                            │   (Local/Cloud) │
                            └─────────────────┘
```

### Production Deployment (Vercel)
```
┌─────────────────┐         ┌─────────────────┐
│  Vercel         │         │  Vercel         │
│  (Frontend)     │────────▶│  (Backend API)   │
│  Static Build   │         │  Serverless     │
└─────────────────┘         └─────────────────┘
                                      │
                                      ▼
                            ┌─────────────────┐
                            │  MongoDB Atlas  │
                            │  (Cloud)        │
                            └─────────────────┘
```

---

## 2.9 Security Architecture

### Authentication Flow
```
User → Clerk Sign-In → Clerk Issues JWT → 
Frontend Stores Token → 
API Request with Bearer Token → 
Clerk Middleware Validates → 
Controller Processes Request
```

### Authorization Layers
1. **Clerk Middleware**: Validates JWT token (all protected routes)
2. **protectEducator Middleware**: Checks `publicMetadata.role === 'educator'`
3. **Controller-Level Checks**: Validates user ownership (e.g., rating only if enrolled)

### Data Protection
- Sensitive data (passwords, tokens) never stored in application DB
- API keys stored in environment variables
- Webhook signatures verified (Svix for Clerk, Stripe signature verification)

---

## 2.10 Summary

The LMS Website architecture follows a **layered, modular design** with clear separation of concerns. The system integrates multiple external services through well-defined APIs and webhooks. While currently monolithic, the architecture supports future microservices migration. Key strengths include modularity, RESTful design, and external service integration. Recommended improvements focus on scalability (caching, message queues), observability (logging, monitoring), and documentation (API docs).
