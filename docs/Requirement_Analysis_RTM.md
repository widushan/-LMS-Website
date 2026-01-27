# Requirement Analysis & RTM — LMS Website (MERN)

## System Feature Inventory (Observed)

### Student-facing
- **Browse courses**: View all published courses.
- **Search courses**: Filter course list by course title.
- **Course details**: View course metadata, structure (chapters/lectures), preview free lectures, pricing + discount, rating summary, enroll count.
- **Purchase course**: Start Stripe Checkout session for a selected course.
- **My enrollments**: View enrolled courses and progress percentage.
- **Course player**: Watch enrolled course lectures (URLs available for enrolled courses), mark lecture complete, rate course.

### Educator-facing
- **Upgrade role to educator**: Sets Clerk `publicMetadata.role = educator`.
- **Add course**: Create course (title, rich-text description, price, discount, thumbnail upload, chapters/lectures).
- **My courses**: View educator’s courses, enrolled student count, computed earnings, publish date.
- **Dashboard**: Total enrollments, total courses, total earnings, latest enrollments list.
- **Students enrolled**: List enrolled students with course title + purchase date.

### Backend/Infrastructure
- **Authentication**: Clerk middleware required for user/educator APIs.
- **Payments**: Stripe Checkout + Stripe webhooks to confirm enrollment and purchase status.
- **Storage**: MongoDB for Users/Courses/Purchases/Progress.
- **Media**: Cloudinary for course thumbnail uploads.

## Requirements (Derived from current behavior)

> IDs are for traceability; you can adjust wording to match your report style.

- **FR-01**: System shall display a list of published courses to any user (unauthenticated allowed).
- **FR-02**: System shall allow users to filter/search courses by course title.
- **FR-03**: System shall display course details including title, description, price, discount, chapters, lectures, rating summary, and enrolled count.
- **FR-04**: System shall allow preview of lectures marked as “preview free” from the course details page.
- **FR-05**: System shall require authentication before a user can purchase/enroll in a course.
- **FR-06**: System shall initiate Stripe Checkout for course purchase and redirect the user to Stripe’s hosted checkout.
- **FR-07**: System shall enroll the user into the course only after Stripe payment succeeds (webhook-confirmed).
- **FR-08**: System shall show “My Enrollments” for authenticated users and display per-course progress (completed lectures / total lectures).
- **FR-09**: System shall allow enrolled users to watch lecture videos within the player.
- **FR-10**: System shall allow enrolled users to mark a lecture as completed and persist progress.
- **FR-11**: System shall allow enrolled users to submit/update a 1–5 rating for a course.
- **FR-12**: System shall allow a user to upgrade to educator role.
- **FR-13**: System shall allow educators to add a course with thumbnail, chapters, and lectures (incl. preview-free flag).
- **FR-14**: System shall allow educators to view their courses list with enrolled count and computed earnings.
- **FR-15**: System shall allow educators to view dashboard totals (earnings, enrollments, total courses) and latest enrollments.
- **FR-16**: System shall allow educators to view enrolled students with course title and purchase date.

## Unclear / Missing Requirements (Questions + Assumptions)

These are items you can raise as “unclear requirements” in your analysis.

- **Role upgrade governance**: Who is allowed to become an educator? (Currently any authenticated user can call the upgrade endpoint.)
- **Course publishing workflow**: Should courses be draft by default? (Currently `isPublished` defaults to `true`; no UI/API to unpublish.)
- **Payment edge cases**:
  - What happens if a user purchases the same course twice?
  - Should purchases be idempotent (one active enrollment per user per course)?
  - Should “cancel_url” return to course details instead of home?
- **Access control for lectures**:
  - Are “paid lectures” supposed to be hidden entirely or visible but locked?
  - Current approach hides lecture URLs on the public course-details API, but player uses enrolled course data to watch.
- **Progress completion rules**:
  - What defines course completion? (There is a `completed` flag in DB but it is never set.)
  - Can a user “un-complete” a lecture?
- **Ratings rules**:
  - Should ratings be allowed only after completing the course, or any time after enrollment?
  - Should written reviews exist, or only star ratings?
- **Data validation**:
  - Lecture URL format assumptions (YouTube-only?) are implied by `split('/').pop()`.
  - Should duration accept decimals, zero, negative values?
- **Known implementation defects impacting requirements** (good to note in analysis):
  - `educatorController.addCourse` uses `req.auth.userId` instead of `req.auth().userId` (likely breaks course creation).
  - `clerkWebhooks` user.updated handler uses `data.email_address[0]` (likely typo; should be `email_addresses`).
  - `CourseProgress.courseId` is stored as `String`, while other code often uses ObjectId strings; clarify expected type consistency.

## Requirement Traceability Matrix (RTM)

| Req ID | Requirement | UI (Client) | API (Server) | DB Models | Notes / Suggested Tests |
|---|---|---|---|---|---|
| FR-01 | Browse published courses | `client/src/pages/student/CoursesList.jsx`, `client/src/context/AppContext.jsx` | `GET /api/course/all` (`courseController.getAllCourse`) | `Course` | Verify only `isPublished=true` courses show; verify response excludes `courseContent`. |
| FR-02 | Search by title | `client/src/pages/student/CoursesList.jsx` | (client-side filter) | `Course` | EP/BVA on search input: empty, mixed case, special chars. |
| FR-03 | View course details | `client/src/pages/student/CourseDetails.jsx` | `GET /api/course/:id` (`courseController.getCourseId`) | `Course` | Verify locked lectures have blank URL; verify ratings/enrolled count displayed. |
| FR-04 | Preview free lectures | `CourseDetails.jsx` (Preview link) | `GET /api/course/:id` | `Course` | Verify only `isPreviewFree=true` lectures show Preview and play. |
| FR-05 | Auth required to purchase | `CourseDetails.jsx` | `POST /api/user/purchase` (`userController.purchaseCourse`) | `User`, `Purchase`, `Course` | Verify unauth user gets “Login to Enroll”; verify API requires Clerk auth header. |
| FR-06 | Stripe checkout session | `CourseDetails.jsx` (redirect to `session_url`) | `POST /api/user/purchase` | `Purchase` | Verify correct currency, amount calculation with discount, metadata includes `purchaseId`. |
| FR-07 | Enroll after payment success | n/a (webhook-driven) | `POST /stripe` (`webhooks.stripeWebhooks`) | `Purchase`, `User`, `Course` | Verify `Purchase.status` transitions `pending -> completed`; user+course arrays updated once. |
| FR-08 | View enrollments + progress | `client/src/pages/student/MyEnrollments.jsx` | `GET /api/user/enrolled-courses`, `POST /api/user/get-course-progress` | `User`, `CourseProgress` | Verify progress percent calc; verify zero-progress new enrollments show 0%. |
| FR-09 | Watch lectures (enrolled) | `client/src/pages/student/Player.jsx` | (data comes via enrolled courses) | `User`, `Course` | Verify Watch link exists only when `lectureUrl` present; confirm non-enrolled cannot access Player route meaningfully. |
| FR-10 | Mark lecture complete | `Player.jsx` | `POST /api/user/update-course-progress` | `CourseProgress` | Verify idempotency (“already completed”); verify `lectureCompleted` grows correctly. |
| FR-11 | Rate course 1–5 | `Player.jsx`, `client/src/components/student/Rating.jsx` | `POST /api/user/add-rating` | `Course`, `User` | Verify only enrolled users can rate; verify update existing rating; BVA rating=0,1,5,6. |
| FR-12 | Upgrade educator role | `client/src/components/student/Navbar.jsx` | `GET /api/educator/update-role` | (Clerk metadata) | Verify role change reflected; clarify if admin approval required. |
| FR-13 | Add course | `client/src/pages/educator/AddCourse.jsx` | `POST /api/educator/add-course` | `Course` | Verify multipart upload, Cloudinary URL stored; validate chapter/lecture required fields. |
| FR-14 | Educator “My Courses” | `client/src/pages/educator/MyCourses.jsx` | `GET /api/educator/courses` | `Course` | Verify only educator’s courses returned; verify earnings calc matches backend expectations. |
| FR-15 | Educator dashboard | `client/src/pages/educator/Dashboard.jsx` | `GET /api/educator/dashboard` | `Course`, `Purchase`, `User` | Verify totals; verify only `Purchase.status=completed` counts towards earnings/enrollments. |
| FR-16 | Enrolled students list | `client/src/pages/educator/StudentsEnrolled.jsx` | `GET /api/educator/enrolled-students` | `Purchase`, `User`, `Course` | Verify sorting (latest first), purchase date display, correctness of joins (populate). |

