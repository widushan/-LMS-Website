# Defect Report — LMS Website

**Project:** LMS Website (MERN)  
**Report Date:** January 28, 2025  
**Report Version:** 1.0  

---

## Severity & Priority Definitions

| **Severity** | Meaning |
|-------------|---------|
| **Critical** | System/feature unusable; data loss or security breach; no workaround. |
| **Major** | Important feature broken or severely impaired; workaround difficult. |
| **Minor** | Feature works with limitations or cosmetic/UX issue; workaround exists. |
| **Trivial** | Cosmetic, typo, or very low impact. |

| **Priority** | Meaning |
|-------------|---------|
| **P1 – High** | Fix as soon as possible; blocks release or key users. |
| **P2 – Medium** | Fix in current/release cycle; important but not blocking. |
| **P3 – Low** | Fix when possible; backlog. |

---

## Defects (10+ reported)

| # | Defect ID | Summary | Module / Component | Severity | Priority | Description | Steps to Reproduce | Expected Result | Actual Result |
|---|-----------|---------|--------------------|----------|----------|-------------|--------------------|-----------------|---------------|
| 1 | DEF-001 | Educator Add Course fails – wrong auth property | Server / educatorController | **Critical** | **P1** | Add-course API uses `req.auth.userId` instead of `req.auth().userId`, causing educator ID to be undefined when creating a course. | 1. Log in as educator. 2. Go to Add Course. 3. Fill form and submit. | Course is created and saved to DB. | Course creation fails; educator ID is undefined; course not saved. |
| 2 | DEF-002 | Clerk webhook user.updated uses wrong field name | Server / webhooks | **Major** | **P1** | Webhook handler references `data.email_address[0]` instead of `data.email_addresses` (Clerk API), causing sync/update to fail or throw. | 1. Trigger Clerk user.updated webhook (e.g. user updates email in Clerk). | User record in DB is updated with new email. | Error or no update; possible 500 or unhandled exception. |
| 3 | DEF-003 | Course progress courseId type inconsistency | Server / models & userController | **Major** | **P2** | `CourseProgress.courseId` stored as String while other code uses ObjectId strings; can cause lookup/join mismatches. | 1. Enroll in course. 2. Complete a lecture. 3. View My Enrollments progress. | Progress shows correctly for all enrollments. | Some progress may not match or display incorrectly depending on comparison logic. |
| 4 | DEF-004 | No server-side validation for rating value (1–5) | Server / userController | **Major** | **P2** | API accepts rating without validating range; values &lt; 1 or &gt; 5 can be stored. | 1. Enroll in course. 2. Call POST /api/user/add-rating with rating: 0 or 6 (e.g. via dev tools). | Request rejected with 400 and validation message. | Invalid value stored; rating display/aggregation incorrect. |
| 5 | DEF-005 | Search is client-side only – no pagination on large list | Client / CoursesList | **Minor** | **P2** | All courses loaded then filtered in browser; no server-side search or pagination. | 1. Add 100+ published courses. 2. Open course list and search. | Search is fast and scalable (server-side or paginated). | All courses loaded; slow with many courses; no pagination. |
| 6 | DEF-006 | No duplicate purchase check before creating Stripe session | Server / userController | **Major** | **P2** | User can start Stripe checkout again for already enrolled course, leading to duplicate payment attempts. | 1. Enroll in course A. 2. Open course A details. 3. Click Enroll/Purchase again. | Button disabled or message “Already enrolled”; no new checkout. | New Stripe session created; user may pay twice for same course. |
| 7 | DEF-007 | Lecture duration accepts zero or negative in Add Course | Client & Server / AddCourse | **Minor** | **P3** | Duration field allows 0 or negative; no validation. | 1. As educator, Add Course. 2. Add lecture with duration 0 or -5. 3. Save. | Validation error; only positive duration allowed. | Course saved with invalid duration; display/calculations wrong. |
| 8 | DEF-008 | Missing focus indicator on key interactive elements | Client / global (buttons, links) | **Minor** | **P2** | Keyboard users cannot clearly see focus on some buttons/links (accessibility). | 1. Use Tab to navigate (no mouse). 2. Move through Enroll, Search, nav links. | Visible focus ring on all focusable elements. | Focus not visible or inconsistent (fails WCAG 2.4.7). |
| 9 | DEF-009 | Error message on course fetch shows generic “error.message” | Client / CourseDetails | **Minor** | **P3** | Network or server errors display raw `error.message`, which may be technical or empty. | 1. Stop server or use invalid course ID. 2. Open course details page. | User-friendly message e.g. “Course unavailable. Try again later.” | Technical or empty message shown. |
| 10 | DEF-010 | Course completion flag never set in database | Server / userController & models | **Major** | **P2** | `CourseProgress` has `completed` field but it is never updated when user completes all lectures. | 1. Enroll in course. 2. Mark all lectures complete. 3. Check progress/DB. | `completed: true` when all lectures done; “Course completed” in UI. | `completed` remains false; no “course completed” state. |
| 11 | DEF-011 | No unpublish/draft for courses – all new courses go live | Server & Client / Course model & educator | **Minor** | **P3** | New courses created with `isPublished: true`; no draft or unpublish option. | 1. Educator adds new course and saves. | Option to save as draft or unpublish. | Course is live immediately; cannot prepare without publishing. |
| 12 | DEF-012 | Cancel URL after Stripe checkout returns to home instead of course | Client & Server / purchase flow | **Minor** | **P3** | Stripe `cancel_url` points to home; user loses context of the course they were purchasing. | 1. Start purchase for a course. 2. On Stripe page, click “Back” or cancel. | Redirect to same course details page. | Redirect to home; user must search for course again. |

---

## Summary by Severity

| Severity | Count |
|----------|-------|
| Critical | 1 |
| Major    | 5 |
| Minor    | 6 |

## Summary by Priority

| Priority | Count |
|---------|-------|
| P1 – High   | 2 |
| P2 – Medium  | 6 |
| P3 – Low    | 4 |

---

## Evidence & Traceability

- **DEF-001, DEF-002, DEF-003**: Aligned with “Known implementation defects” in `docs/Requirement_Analysis_RTM.md`.
- **DEF-004 to DEF-012**: Derived from RTM test suggestions, OWASP/accessibility good practice, and observed behavior (course list, purchase flow, progress, ratings, Add Course).

For formal evidence: capture screenshots of failed steps, API request/response (e.g. Postman), and server logs for each defect when reproducing.
