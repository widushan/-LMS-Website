# EduLanka — LMS Website (MERN)

EduLanka is a full‑stack Learning Management System built with **React (Vite)** and **Node/Express + MongoDB**, featuring **Clerk** authentication, **Stripe** payments, and **Cloudinary** media storage.

It is designed as a realistic LMS for students and educators, and as a strong testing/QA artifact for your assignment.

---

## Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Backend (server)](#backend-server)
  - [Frontend (client)](#frontend-client)
  - [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Testing & Documentation](#testing--documentation)
- [Automation & Design Analysis](#automation--design-analysis)

---

## Features

### Student Experience

- **Course discovery**: Browse and search all published courses.
- **Rich course details**: Description, structure (chapters/lectures), ratings, enrolled count.
- **Free previews**: Play selected lectures without enrolling.
- **Secure enrollment**: Purchase via Stripe Checkout, enrollment confirmed by webhook.
- **My Enrollments**: Track enrolled courses with visual progress bars.
- **Course player**: Watch lectures, mark them complete, and continue where you left off.
- **Ratings**: Rate courses (1–5) after enrollment.

### Educator Experience

- **Role upgrade**: Become an educator from your student account.
- **Course authoring**:
  - Title, rich‑text description, price, discount.
  - Thumbnail upload via Cloudinary.
  - Chapters and lectures with duration, URL, and free‑preview flag.
- **Dashboard**:
  - Total enrollments.
  - Total courses.
  - Total earnings (from completed purchases).
  - Latest enrollments table.
- **Course management**:
  - My Courses list with earnings and student counts.
  - Students Enrolled view with course title and purchase date.

---

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS, Axios, React Router, React Toastify, React YouTube.
- **Backend**: Node.js, Express, Mongoose.
- **Authentication**: Clerk (JWT + webhooks).
- **Payments**: Stripe (Checkout + webhooks).
- **Media**: Cloudinary.
- **Database**: MongoDB.

---

## Project Structure

```bash
client/       # React (Vite) frontend
server/       # Express API + MongoDB models
docs/         # Requirement, design, and testing documentation
scripts/      # Analysis scripts (SOLID/GRASP metrics helper)
automation/   # UI automation examples (Selenium)
```

---

## Getting Started

### Backend (server)

```bash
cd server
npm install
npm run server
```

Server runs on `http://localhost:5000` by default.

### Frontend (client)

```bash
cd client
npm install
npm run dev
```

Client runs on `http://localhost:5173` by default.

### Environment Variables

Create `.env` inside `server/`:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Clerk
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
CURRENCY=LKR

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Server
PORT=5000
```

Create `.env` inside `client/`:

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_CURRENCY=Rs
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

---

## API Overview

**Base URL**: `http://localhost:5000`

### Public

- `GET /api/course/all` — list all published courses (without full content).
- `GET /api/course/:id` — course details + gated lecture URLs.

### Protected (requires `Authorization: Bearer <Clerk token>`)

- `GET /api/user/data`
- `GET /api/user/enrolled-courses`
- `POST /api/user/purchase`
- `POST /api/user/update-course-progress`
- `POST /api/user/get-course-progress`
- `POST /api/user/add-rating`
- `GET /api/educator/update-role`
- `POST /api/educator/add-course`
- `GET /api/educator/courses`
- `GET /api/educator/dashboard`
- `GET /api/educator/enrolled-students`

You can import these into Postman and reuse the Clerk token from your browser’s Network tab.

---

## Testing & Documentation

All assignment documentation lives in `docs/` and is ready to attach to your report:

- `docs/Requirement_Analysis_RTM.md`
- `docs/Architectural_Design.md`
- `docs/Behavioural_Design.md`
- `docs/Structural_Design.md`
- `docs/UI_UX_Design.md`
- `docs/Design_Evaluation.md`
- `docs/How_To_Run_Design_Analysis.md`
- `docs/SOLID_GRASP_Evaluation_Guide.md`
- `docs/SOLID_GRASP_Evaluation_Template.md`

---

## Automation & Design Analysis

### UI Automation (Selenium)

Examples in `automation/ui/`:

- `test_course_list.py` — open course list and view first course.
- `test_search_and_open_course.py` — search and open a course.
- `test_course_list_page_ui.py` — verify course list UI.

### Design Metrics Script (SOLID/GRASP indicators)

From project root:

```bash
node scripts/analyze-design.js
```

This prints a design report to the console and writes `design-analysis-report.json` with:

- File metrics and complexity.
- Coupling and cohesion indicators.
- SOLID/GRASP summary and recommendations.

---

## Notes

- The app uses **Clerk** for authentication and **Stripe webhooks** to confirm enrollments.
- Lecture videos are loaded from YouTube; use valid YouTube URLs (watch, youtu.be, embed, shorts).
- Course and chapter durations are stored in minutes and displayed with two‑decimal precision for clarity.

You can clone, run, and extend this LMS as a base for your own EdTech projects or as a rich subject for software testing and design assignments.