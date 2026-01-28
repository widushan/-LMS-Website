# 3. Behavioural Design – LMS Website

This document presents sequence diagrams, activity diagrams, and state machine diagrams for key workflows in the LMS system.

---

## 3.1 Sequence Diagrams

### 3.1.1 Course Purchase and Enrollment Sequence Diagram

**Scenario**: Student purchases a course and gets enrolled after successful payment.

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Student  │    │ Frontend │    │ Backend  │    │ Stripe   │    │ MongoDB  │    │ Clerk    │
│ Browser  │    │ (React)  │    │ (Express)│    │          │    │          │    │          │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │                │                │                │                │                │
     │ 1. Click       │                │                │                │                │
     │ "Enroll Now"   │                │                │                │                │
     ├───────────────>│                │                │                │                │
     │                │                │                │                │                │
     │                │ 2. POST /api/user/purchase      │                │                │
     │                │    {courseId, Authorization}     │                │                │
     │                ├────────────────────────────────>│                │                │
     │                │                │                │                │                │
     │                │                │ 3. Validate JWT│                │                │
     │                │                ├─────────────────────────────────────────────────>│
     │                │                │<─────────────────────────────────────────────────┤
     │                │                │                │                │                │
     │                │                │ 4. Find User & Course                           │
     │                │                ├─────────────────────────────────────────────────>│
     │                │                │<─────────────────────────────────────────────────┤
     │                │                │                │                │                │
     │                │                │ 5. Create Purchase (status: pending)            │
     │                │                ├─────────────────────────────────────────────────>│
     │                │                │<─────────────────────────────────────────────────┤
     │                │                │                │                │                │
     │                │                │ 6. Create Stripe Checkout Session              │
     │                │                ├─────────────────────────────────────────────────>│
     │                │                │                │ 7. Return session_url        │
     │                │                │<─────────────────────────────────────────────────┤
     │                │                │                │                │                │
     │                │ 8. Return session_url            │                │                │
     │                │<─────────────────────────────────┤                │                │
     │                │                │                │                │                │
     │ 9. Redirect to Stripe Checkout                   │                │                │
     │<──────────────────────────────────────────────────┤                │                │
     │                │                │                │                │                │
     │ 10. Complete Payment                             │                │                │
     ├───────────────────────────────────────────────────────────────────────────────────>│
     │                │                │                │                │                │
     │                │                │                │ 11. payment_intent.succeeded   │
     │                │                │                │    Webhook Event               │
     │                │                │<─────────────────────────────────────────────────┤
     │                │                │                │                │                │
     │                │                │ 12. Verify Webhook Signature                     │
     │                │                ├─────────────────────────────────────────────────>│
     │                │                │                │                │                │
     │                │                │ 13. Find Purchase by purchaseId                  │
     │                │                ├─────────────────────────────────────────────────>│
     │                │                │<─────────────────────────────────────────────────┤
     │                │                │                │                │                │
     │                │                │ 14. Update Purchase.status = 'completed'        │
     │                │                ├─────────────────────────────────────────────────>│
     │                │                │                │                │                │
     │                │                │ 15. Add courseId to User.enrolledCourses        │
     │                │                ├─────────────────────────────────────────────────>│
     │                │                │                │                │                │
     │                │                │ 16. Add userId to Course.enrolledStudents        │
     │                │                ├─────────────────────────────────────────────────>│
     │                │                │                │                │                │
     │                │                │ 17. Return success                              │
     │                │                │<─────────────────────────────────────────────────┤
     │                │                │                │                │                │
     │ 18. Redirect to /my-enrollements                 │                │                │
     │<──────────────────────────────────────────────────┤                │                │
     │                │                │                │                │                │
     │ 19. Display enrolled course                      │                │                │
     │<──────────────────────────────────────────────────┤                │                │
```

**PlantUML Syntax** (for rendering):
```plantuml
@startuml CoursePurchaseSequence
actor Student
participant "Frontend\n(React)" as Frontend
participant "Backend\n(Express)" as Backend
participant Stripe
database MongoDB
participant Clerk

Student -> Frontend: 1. Click "Enroll Now"
Frontend -> Backend: 2. POST /api/user/purchase\n{courseId, Authorization}
Backend -> Clerk: 3. Validate JWT
Clerk -> Backend: JWT Valid
Backend -> MongoDB: 4. Find User & Course
MongoDB -> Backend: User & Course Data
Backend -> MongoDB: 5. Create Purchase\n(status: pending)
MongoDB -> Backend: Purchase Created
Backend -> Stripe: 6. Create Checkout Session
Stripe -> Backend: 7. Return session_url
Backend -> Frontend: 8. Return session_url
Frontend -> Student: 9. Redirect to Stripe Checkout
Student -> Stripe: 10. Complete Payment
Stripe -> Backend: 11. payment_intent.succeeded\nWebhook Event
Backend -> Stripe: 12. Verify Webhook Signature
Backend -> MongoDB: 13. Find Purchase by purchaseId
MongoDB -> Backend: Purchase Data
Backend -> MongoDB: 14. Update Purchase.status = 'completed'
Backend -> MongoDB: 15. Add courseId to User.enrolledCourses
Backend -> MongoDB: 16. Add userId to Course.enrolledStudents
MongoDB -> Backend: Success
Backend -> Stripe: 17. Return success
Stripe -> Student: 18. Redirect to /my-enrollements
Student -> Frontend: 19. Display enrolled course
@enduml
```

---

### 3.1.2 Course Creation Sequence Diagram

**Scenario**: Educator creates a new course with thumbnail, chapters, and lectures.

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│Educator │    │ Frontend │    │ Backend  │    │Cloudinary│    │ MongoDB  │
│ Browser │    │ (React)  │    │ (Express)│    │          │    │          │
└────┬────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │                │                │                │
     │ 1. Fill form  │                │                │                │
     │ (title, desc, │                │                │                │
     │  price, etc.) │                │                │                │
     ├──────────────>│                │                │                │
     │               │                │                │                │
     │ 2. Upload     │                │                │                │
     │ thumbnail     │                │                │                │
     ├──────────────>│                │                │                │
     │               │                │                │                │
     │ 3. Submit form│                │                │                │
     ├──────────────>│                │                │                │
     │               │                │                │                │
     │               │ 4. POST /api/educator/add-course│                │
     │               │    (multipart/form-data)         │                │
     │               ├─────────────────────────────────>│                │
     │               │                │                │                │
     │               │                │ 5. Validate educator role       │
     │               │                │    (protectEducator middleware)  │
     │               │                │                │                │
     │               │                │ 6. Parse courseData JSON        │
     │               │                │                │                │
     │               │                │ 7. Upload image to Cloudinary   │
     │               │                ├─────────────────────────────────>│
     │               │                │                │ 8. Return secure_url
     │               │                │<─────────────────────────────────┤
     │               │                │                │                │
     │               │                │ 9. Create Course document       │
     │               │                │    (with thumbnail URL)         │
     │               │                ├─────────────────────────────────────────────────>│
     │               │                │                │                │ 10. Course saved
     │               │                │<────────────────────────────────────────────────────┤
     │               │                │                │                │
     │               │ 11. Return success              │                │                │
     │               │<─────────────────────────────────┤                │                │
     │               │                │                │                │
     │ 12. Success toast               │                │                │                │
     │<─────────────────────────────────────────────────┤                │                │
     │               │                │                │                │
     │ 13. Course appears in My Courses│                │                │                │
     │<─────────────────────────────────────────────────┤                │                │
```

**PlantUML Syntax**:
```plantuml
@startuml CourseCreationSequence
actor Educator
participant "Frontend\n(React)" as Frontend
participant "Backend\n(Express)" as Backend
participant Cloudinary
database MongoDB

Educator -> Frontend: 1. Fill form\n(title, desc, price, etc.)
Educator -> Frontend: 2. Upload thumbnail
Educator -> Frontend: 3. Submit form
Frontend -> Backend: 4. POST /api/educator/add-course\n(multipart/form-data)
Backend -> Backend: 5. Validate educator role\n(protectEducator)
Backend -> Backend: 6. Parse courseData JSON
Backend -> Cloudinary: 7. Upload image
Cloudinary -> Backend: 8. Return secure_url
Backend -> MongoDB: 9. Create Course document\n(with thumbnail URL)
MongoDB -> Backend: 10. Course saved
Backend -> Frontend: 11. Return success
Frontend -> Educator: 12. Success toast
Frontend -> Educator: 13. Course appears in My Courses
@enduml
```

---

### 3.1.3 User Authentication Sequence Diagram

**Scenario**: User registers/logs in via Clerk and gets synced to MongoDB.

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  User   │    │ Frontend │    │  Clerk   │    │ Backend  │    │ MongoDB  │
│ Browser │    │ (React)  │    │          │    │ (Express)│    │          │
└────┬────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │                │                │                │
     │ 1. Click      │                │                │                │
     │ "Create       │                │                │                │
     │  Account"     │                │                │                │
     ├──────────────>│                │                │                │
     │               │                │                │                │
     │               │ 2. Open Clerk Sign-In           │                │
     │               ├────────────────────────────────>│                │
     │               │                │                │                │
     │ 3. Enter credentials                            │                │
     ├─────────────────────────────────────────────────>│                │
     │               │                │                │                │
     │               │                │ 4. Authenticate User            │
     │               │                │                │                │
     │               │                │ 5. user.created event           │
     │               │                ├─────────────────────────────────>│
     │               │                │                │                │
     │               │                │                │ 6. Create User  │
     │               │                │                │    in MongoDB  │
     │               │                │                ├────────────────>│
     │               │                │                │<────────────────┤
     │               │                │                │                │
     │               │                │ 7. Return success               │
     │               │                │<─────────────────────────────────┤
     │               │                │                │                │
     │               │ 8. Issue JWT Token              │                │
     │               │<─────────────────────────────────┤                │
     │               │                │                │                │
     │ 9. User logged in, JWT stored                   │                │
     │<─────────────────────────────────────────────────┤                │
     │               │                │                │                │
     │ 10. Access protected pages                       │                │
     │<─────────────────────────────────────────────────┤                │
```

**PlantUML Syntax**:
```plantuml
@startuml UserAuthenticationSequence
actor User
participant "Frontend\n(React)" as Frontend
participant Clerk
participant "Backend\n(Express)" as Backend
database MongoDB

User -> Frontend: 1. Click "Create Account"
Frontend -> Clerk: 2. Open Clerk Sign-In
User -> Clerk: 3. Enter credentials
Clerk -> Clerk: 4. Authenticate User
Clerk -> Backend: 5. user.created event\n(Webhook)
Backend -> MongoDB: 6. Create User in MongoDB
MongoDB -> Backend: User Created
Backend -> Clerk: 7. Return success
Clerk -> Frontend: 8. Issue JWT Token
Frontend -> User: 9. User logged in, JWT stored
Frontend -> User: 10. Access protected pages
@enduml
```

---

### 3.1.4 Mark Lecture Complete Sequence Diagram

**Scenario**: Student marks a lecture as completed and progress is updated.

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Student │    │ Frontend │    │ Backend  │    │ MongoDB  │
│ Browser │    │ (React)  │    │ (Express)│    │          │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │                │                │                │
     │ 1. Watch       │                │                │
     │ lecture        │                │                │
     ├───────────────>│                │                │
     │                │                │                │
     │ 2. Click       │                │                │
     │ "Mark Complete"│                │                │
     ├───────────────>│                │                │
     │                │                │                │
     │                │ 3. POST /api/user/update-course-progress│
     │                │    {courseId, lectureId, Authorization}   │
     │                ├──────────────────────────────────────────>│
     │                │                │                │
     │                │                │ 4. Validate JWT│
     │                │                │                │
     │                │                │ 5. Check if CourseProgress exists│
     │                │                ├──────────────────────────────────>│
     │                │                │<──────────────────────────────────┤
     │                │                │                │
     │                │                │ 6a. If exists: Check if lectureId│
     │                │                │      already in lectureCompleted │
     │                │                │                │
     │                │                │ 6b. If not exists: Create new    │
     │                │                │      CourseProgress              │
     │                │                ├──────────────────────────────────>│
     │                │                │                │
     │                │                │ 7. Update/Create CourseProgress │
     │                │                │    (add lectureId to array)      │
     │                │                ├──────────────────────────────────>│
     │                │                │<──────────────────────────────────┤
     │                │                │                │
     │                │ 8. Return success message        │                │
     │                │<─────────────────────────────────┤                │
     │                │                │                │
     │ 9. Update UI (show completed icon)               │                │
     │<──────────────────────────────────────────────────┤                │
     │                │                │                │
     │ 10. Progress bar updates                         │                │
     │<──────────────────────────────────────────────────┤                │
```

**PlantUML Syntax**:
```plantuml
@startuml MarkLectureCompleteSequence
actor Student
participant "Frontend\n(React)" as Frontend
participant "Backend\n(Express)" as Backend
database MongoDB

Student -> Frontend: 1. Watch lecture
Student -> Frontend: 2. Click "Mark Complete"
Frontend -> Backend: 3. POST /api/user/update-course-progress\n{courseId, lectureId, Authorization}
Backend -> Backend: 4. Validate JWT
Backend -> MongoDB: 5. Check if CourseProgress exists
MongoDB -> Backend: CourseProgress Data (or null)
alt CourseProgress exists
    Backend -> Backend: 6a. Check if lectureId already completed
    alt Already completed
        Backend -> Frontend: Return "Already Completed"
    else Not completed
        Backend -> MongoDB: 7. Update CourseProgress\n(add lectureId)
    end
else CourseProgress does not exist
    Backend -> MongoDB: 6b. Create new CourseProgress\n(lectureCompleted: [lectureId])
end
MongoDB -> Backend: Success
Backend -> Frontend: 8. Return success message
Frontend -> Student: 9. Update UI (show completed icon)
Frontend -> Student: 10. Progress bar updates
@enduml
```

---

## 3.2 Activity Diagrams

### 3.2.1 Student Enrollment Process Activity Diagram

**Description**: Complete flow from browsing courses to being enrolled and accessing content.

```
┌─────────────────────────────────────────────────────────────┐
│              Student Enrollment Process                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Browse Courses  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ View Course     │
                    │ Details         │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Preview Free    │
                    │ Lectures?       │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
            ┌──────────────┐  ┌──────────────┐
            │ Watch Preview│  │ Skip Preview │
            └──────┬───────┘  └──────┬───────┘
                    │                 │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Click "Enroll   │
                    │ Now"            │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ User Logged In?  │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
            ┌──────────────┐  ┌──────────────┐
            │ Already       │  │ Prompt to    │
            │ Enrolled?     │  │ Login        │
            └──────┬───────┘  └──────┬───────┘
                    │                 │
            ┌───────┴───────┐         │
            │               │         │
            ▼               ▼         │
    ┌──────────────┐  ┌──────────────┐│
    │ Show "Already│  │ Create       ││
    │ Enrolled"    │  │ Purchase     ││
    │ Message      │  │ Record       ││
    └──────────────┘  └──────┬───────┘│
                              │        │
                              └────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Create Stripe   │
                    │ Checkout        │
                    │ Session         │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Redirect to     │
                    │ Stripe          │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Complete Payment│
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
            ┌──────────────┐  ┌──────────────┐
            │ Payment      │  │ Payment      │
            │ Success      │  │ Failed       │
            └──────┬───────┘  └──────┬───────┘
                    │                 │
                    │                 ▼
                    │         ┌──────────────┐
                    │         │ Update       │
                    │         │ Purchase     │
                    │         │ status =     │
                    │         │ 'failed'     │
                    │         └──────────────┘
                    │
                    ▼
            ┌─────────────────┐
            │ Stripe Webhook   │
            │ (payment_intent. │
            │ succeeded)       │
            └────────┬─────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Update Purchase │
            │ status =        │
            │ 'completed'     │
            └────────┬─────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Add courseId to  │
            │ User.enrolled    │
            │ Courses          │
            └────────┬─────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Add userId to    │
            │ Course.enrolled │
            │ Students         │
            └────────┬─────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Redirect to      │
            │ /my-enrollements │
            └────────┬─────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Display Enrolled │
            │ Course           │
            └────────┬─────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Access Course    │
            │ Player           │
            └──────────────────┘
```

**PlantUML Syntax**:
```plantuml
@startuml StudentEnrollmentActivity
start
:Browse Courses;
:View Course Details;
:Preview Free Lectures?;
if (Watch Preview?) then (yes)
  :Watch Preview;
else (no)
  :Skip Preview;
endif
:Click "Enroll Now";
if (User Logged In?) then (no)
  :Prompt to Login;
  stop
else (yes)
  if (Already Enrolled?) then (yes)
    :Show "Already Enrolled" Message;
    stop
  else (no)
    :Create Purchase Record;
    :Create Stripe Checkout Session;
    :Redirect to Stripe;
    :Complete Payment;
    if (Payment Success?) then (yes)
      :Stripe Webhook\n(payment_intent.succeeded);
      :Update Purchase status = 'completed';
      :Add courseId to User.enrolledCourses;
      :Add userId to Course.enrolledStudents;
      :Redirect to /my-enrollements;
      :Display Enrolled Course;
      :Access Course Player;
    else (no)
      :Update Purchase status = 'failed';
      stop
    endif
  endif
endif
stop
@enduml
```

---

### 3.2.2 Educator Course Creation Process Activity Diagram

**Description**: Flow for creating and publishing a course.

```
┌─────────────────────────────────────────────────────────────┐
│          Educator Course Creation Process                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Navigate to     │
                    │ Add Course Page │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Enter Course    │
                    │ Title           │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Enter Course    │
                    │ Description     │
                    │ (Rich Text)     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Set Course      │
                    │ Price           │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Set Discount %  │
                    │ (0-100)         │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Upload          │
                    │ Thumbnail       │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Add Chapters    │
                    │ (Repeat)        │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ For Each Chapter│
                    │ Add Lectures    │
                    │ (Repeat)        │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ For Each Lecture│
                    │ - Title         │
                    │ - Duration      │
                    │ - URL           │
                    │ - Preview Flag  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Click "ADD"     │
                    │ Button          │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Validate Form   │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
            ┌──────────────┐  ┌──────────────┐
            │ Valid?       │  │ Show Error   │
            │              │  │ Message      │
            └──────┬───────┘  └──────────────┘
                    │
                    ▼
            ┌─────────────────┐
            │ Upload Image to  │
            │ Cloudinary       │
            └────────┬─────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Receive         │
            │ secure_url      │
            └────────┬─────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Create Course    │
            │ Document in      │
            │ MongoDB          │
            └────────┬─────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Show Success    │
            │ Toast           │
            └────────┬─────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Course Appears  │
            │ in My Courses   │
            └────────┬─────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Course Visible  │
            │ in Student      │
            │ Catalog         │
            └──────────────────┘
```

**PlantUML Syntax**:
```plantuml
@startuml EducatorCourseCreationActivity
start
:Navigate to Add Course Page;
:Enter Course Title;
:Enter Course Description\n(Rich Text);
:Set Course Price;
:Set Discount % (0-100);
:Upload Thumbnail;
repeat
  :Add Chapter;
repeat
  :Add Lecture\n(Title, Duration, URL, Preview Flag);
repeat while (More Lectures?)
repeat while (More Chapters?)
:Click "ADD" Button;
:Validate Form;
if (Valid?) then (no)
  :Show Error Message;
  stop
else (yes)
  :Upload Image to Cloudinary;
  :Receive secure_url;
  :Create Course Document in MongoDB;
  :Show Success Toast;
  :Course Appears in My Courses;
  :Course Visible in Student Catalog;
endif
stop
@enduml
```

---

### 3.2.3 Course Rating Process Activity Diagram

**Description**: Student rates an enrolled course.

```
┌─────────────────────────────────────────────────────────────┐
│              Course Rating Process                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Open Course     │
                    │ Player          │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Scroll to       │
                    │ Rating Section  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Click Star      │
                    │ Rating (1-5)    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ POST /api/user/ │
                    │ add-rating      │
                    │ {courseId,      │
                    │  rating}        │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Validate Input   │
                    │ (rating 1-5?)   │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
            ┌──────────────┐  ┌──────────────┐
            │ Valid        │  │ Return Error │
            │              │  │ "Invalid     │
            └──────┬───────┘  │ Details"     │
                   │          └──────────────┘
                   │
                   ▼
            ┌─────────────────┐
            │ Check User      │
            │ Enrolled?       │
            └────────┬────────┘
                     │
            ┌────────┴────────┐
            │                 │
            ▼                 ▼
    ┌──────────────┐  ┌──────────────┐
    │ Enrolled     │  │ Return Error │
    │              │  │ "User has not│
    └──────┬───────┘  │ purchased"   │
           │          └──────────────┘
           │
           ▼
    ┌─────────────────┐
    │ Check Existing  │
    │ Rating          │
    └────────┬────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ Rating       │  │ Add New      │
│ Exists?      │  │ Rating Entry │
│              │  │              │
│ Update       │  │              │
│ Existing     │  │              │
│ Rating       │  │              │
└──────┬───────┘  └──────┬───────┘
       │                 │
       └────────┬────────┘
                │
                ▼
        ┌─────────────────┐
        │ Save Course     │
        │ Document        │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ Recalculate    │
        │ Average Rating  │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ Return Success  │
        │ Message         │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ Update UI       │
        │ (Show Updated   │
        │ Rating)         │
        └──────────────────┘
```

**PlantUML Syntax**:
```plantuml
@startuml CourseRatingActivity
start
:Open Course Player;
:Scroll to Rating Section;
:Click Star Rating (1-5);
:POST /api/user/add-rating\n{courseId, rating};
:Validate Input\n(rating 1-5?);
if (Valid?) then (no)
  :Return Error "Invalid Details";
  stop
else (yes)
  :Check User Enrolled?;
  if (Enrolled?) then (no)
    :Return Error "User has not purchased";
    stop
  else (yes)
    :Check Existing Rating;
    if (Rating Exists?) then (yes)
      :Update Existing Rating;
    else (no)
      :Add New Rating Entry;
    endif
    :Save Course Document;
    :Recalculate Average Rating;
    :Return Success Message;
    :Update UI\n(Show Updated Rating);
  endif
endif
stop
@enduml
```

---

## 3.3 State Machine Diagrams

### 3.3.1 Purchase/Payment State Machine

**Description**: States and transitions for a course purchase transaction.

```
┌─────────────────────────────────────────────────────────────┐
│              Purchase/Payment State Machine                  │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   [Initial]  │
                    └──────┬───────┘
                           │
                           │ User clicks "Enroll Now"
                           ▼
                    ┌──────────────┐
                    │   PENDING    │◄──────────┐
                    │  (Purchase   │           │
                    │   created)   │           │
                    └──────┬───────┘           │
                           │                   │
                           │ Stripe session    │
                           │ created           │
                           ▼                   │
                    ┌──────────────┐           │
                    │  CHECKOUT    │           │
                    │  (Redirected │           │
                    │   to Stripe) │           │
                    └──────┬───────┘           │
                           │                   │
                    ┌──────┴───────┐           │
                    │               │           │
                    ▼               ▼           │
            ┌──────────────┐  ┌──────────────┐ │
            │  COMPLETED   │  │   FAILED     │ │
            │  (Payment    │  │  (Payment    │ │
            │   success    │  │   failed or  │ │
            │   webhook)   │  │   cancelled) │ │
            └──────────────┘  └──────────────┘ │
                    │                   │       │
                    │                   │       │
                    │                   └───────┘
                    │                   (Retry possible)
                    │
                    ▼
            ┌──────────────┐
            │  ENROLLED    │
            │  (User added │
            │   to course) │
            └──────────────┘
```

**State Transitions**:
- **Initial → PENDING**: User clicks "Enroll Now", Purchase document created with `status: 'pending'`
- **PENDING → CHECKOUT**: Stripe Checkout session created, user redirected
- **CHECKOUT → COMPLETED**: Stripe webhook `payment_intent.succeeded` received
- **CHECKOUT → FAILED**: Stripe webhook `payment_intent.payment_failed` received or user cancels
- **FAILED → PENDING**: User retries purchase (new Purchase document created)
- **COMPLETED → ENROLLED**: Backend updates User and Course documents

**PlantUML Syntax**:
```plantuml
@startuml PurchaseStateMachine
[*] --> PENDING : User clicks "Enroll Now"
PENDING --> CHECKOUT : Stripe session created
CHECKOUT --> COMPLETED : payment_intent.succeeded
CHECKOUT --> FAILED : payment_intent.payment_failed\nor user cancels
FAILED --> PENDING : User retries
COMPLETED --> ENROLLED : User & Course updated
ENROLLED --> [*]
@enduml
```

---

### 3.3.2 Course Publication State Machine

**Description**: States for course visibility and publication status.

```
┌─────────────────────────────────────────────────────────────┐
│           Course Publication State Machine                    │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   [DRAFT]    │
                    │  (Course     │
                    │   created,   │
                    │   not saved) │
                    └──────┬───────┘
                           │
                           │ Educator saves course
                           ▼
                    ┌──────────────┐
                    │   CREATED    │
                    │  (isPublished│
                    │   = true by  │
                    │   default)   │
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    │               │
                    ▼               ▼
            ┌──────────────┐  ┌──────────────┐
            │  PUBLISHED   │  │  UNPUBLISHED  │
            │  (Visible in │  │  (Not visible│
            │   catalog)   │  │   to students)│
            └──────┬───────┘  └──────┬───────┘
                   │                 │
                   │                 │
                   └────────┬────────┘
                            │
                            │ (Future: Toggle)
                            ▼
                    ┌──────────────┐
                    │   ARCHIVED   │
                    │  (Course no  │
                    │   longer     │
                    │   available) │
                    └──────────────┘
```

**State Transitions**:
- **DRAFT → CREATED**: Course saved to database (`isPublished: true` by default)
- **CREATED → PUBLISHED**: Course appears in student catalog (current implementation)
- **CREATED → UNPUBLISHED**: If `isPublished: false` (not currently implemented in UI)
- **PUBLISHED ↔ UNPUBLISHED**: Toggle publication status (future feature)
- **PUBLISHED/UNPUBLISHED → ARCHIVED**: Course archived/deleted (future feature)

**Note**: Current implementation sets `isPublished: true` by default and doesn't provide UI to unpublish. This state machine represents an improved design.

**PlantUML Syntax**:
```plantuml
@startuml CoursePublicationStateMachine
[*] --> DRAFT : Educator starts creating
DRAFT --> CREATED : Course saved\n(isPublished: true)
CREATED --> PUBLISHED : Course visible in catalog
CREATED --> UNPUBLISHED : isPublished: false\n(not in UI yet)
PUBLISHED <--> UNPUBLISHED : Toggle publication\n(future feature)
PUBLISHED --> ARCHIVED : Archive course\n(future feature)
UNPUBLISHED --> ARCHIVED : Archive course\n(future feature)
ARCHIVED --> [*]
@enduml
```

---

### 3.3.3 User Role State Machine

**Description**: User role transitions (Student ↔ Educator).

```
┌─────────────────────────────────────────────────────────────┐
│              User Role State Machine                         │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   [GUEST]    │
                    │  (Not logged │
                    │   in)        │
                    └──────┬───────┘
                           │
                           │ Clerk sign-up/login
                           ▼
                    ┌──────────────┐
                    │   STUDENT    │◄──────────┐
                    │  (Default    │           │
                    │   role)      │           │
                    └──────┬───────┘           │
                           │                   │
                           │ Click "Become     │
                           │  Educator"        │
                           ▼                   │
                    ┌──────────────┐           │
                    │  EDUCATOR    │           │
                    │  (Can create │           │
                    │   courses)   │           │
                    └──────┬───────┘           │
                           │                   │
                           │ (Future: Role     │
                           │  revocation)      │
                           └───────────────────┘
```

**State Transitions**:
- **GUEST → STUDENT**: User registers/logs in via Clerk
- **STUDENT → EDUCATOR**: User clicks "Become Educator", Clerk metadata updated to `role: 'educator'`
- **EDUCATOR → STUDENT**: Role revocation (not currently implemented, future feature)

**PlantUML Syntax**:
```plantuml
@startuml UserRoleStateMachine
[*] --> GUEST : Initial state
GUEST --> STUDENT : Clerk sign-up/login
STUDENT --> EDUCATOR : Click "Become Educator"
EDUCATOR --> STUDENT : Role revocation\n(future feature)
STUDENT --> [*] : Logout
EDUCATOR --> [*] : Logout
@enduml
```

---

### 3.3.4 Course Progress State Machine

**Description**: States for tracking student progress through a course.

```
┌─────────────────────────────────────────────────────────────┐
│            Course Progress State Machine                      │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   [NONE]     │
                    │  (Not        │
                    │   enrolled)  │
                    └──────┬───────┘
                           │
                           │ Purchase completed
                           ▼
                    ┌──────────────┐
                    │  ENROLLED    │
                    │  (Course     │
                    │   Progress   │
                    │   created)   │
                    └──────┬───────┘
                           │
                           │ Mark first lecture complete
                           ▼
                    ┌──────────────┐
                    │  IN_PROGRESS │
                    │  (Some       │
                    │   lectures   │
                    │   completed) │
                    └──────┬───────┘
                           │
                           │ Mark all lectures complete
                           ▼
                    ┌──────────────┐
                    │  COMPLETED   │
                    │  (All        │
                    │   lectures   │
                    │   done)      │
                    └──────────────┘
```

**State Transitions**:
- **NONE → ENROLLED**: Purchase completed, CourseProgress document created (or first lecture marked)
- **ENROLLED → IN_PROGRESS**: First lecture marked as completed
- **IN_PROGRESS → IN_PROGRESS**: Additional lectures marked (self-loop)
- **IN_PROGRESS → COMPLETED**: All lectures in course marked as completed

**Note**: Current implementation doesn't explicitly set a `completed` flag in CourseProgress model, but completion can be inferred from `lectureCompleted.length === totalLectures`.

**PlantUML Syntax**:
```plantuml
@startuml CourseProgressStateMachine
[*] --> NONE : Not enrolled
NONE --> ENROLLED : Purchase completed
ENROLLED --> IN_PROGRESS : Mark first lecture complete
IN_PROGRESS --> IN_PROGRESS : Mark additional lecture
IN_PROGRESS --> COMPLETED : Mark all lectures complete
COMPLETED --> [*]
@enduml
```

---

## 3.4 Summary

This behavioral design document presents:

1. **Sequence Diagrams**: 4 key workflows (Purchase, Course Creation, Authentication, Mark Lecture Complete)
2. **Activity Diagrams**: 3 processes (Student Enrollment, Educator Course Creation, Course Rating)
3. **State Machine Diagrams**: 4 state machines (Purchase/Payment, Course Publication, User Role, Course Progress)

All diagrams are provided in both **text format** (for documentation) and **PlantUML syntax** (for rendering visual diagrams). These diagrams help visualize system behavior, identify potential issues, and guide implementation and testing.
