# Technical Specification: Online Language School Platform

## 1. Project Overview

An online classroom platform for a language school, enabling students to purchase and attend 1-on-1 lessons, watch video courses, and join group classes. The platform supports three user roles: **Student**, **Professor**, and **Admin**.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 19+ (App Router) |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js v5 |
| Payments | PayPal REST API (Orders API v2) |
| Video Hosting | Vimeo Pro/Business (embedded player) |
| PDF Generation | React-PDF or Puppeteer (invoices) |
| Deployment | Vercel + Neon/Supabase PostgreSQL |

---

## 3. User Roles

| Role | Description |
|---|---|
| Student | Purchases lessons/packages/courses, books time slots, views history |
| Professor | Manages availability, views earnings and lesson history, manages student sessions |
| Admin | Full platform oversight, financial dashboard, user management |

---

## 4. Business Rules

### 4.1 Cancellation Policy
- Students may cancel a scheduled lesson **up to 12 hours before the scheduled start time** at no cost.
- Cancellations made **less than 12 hours** before the lesson are considered **late cancellations**:
  - The lesson is marked as `cancelled (late)` and counts as **used** (deducted from the package or non-refundable for single class).
  - No automatic refund is issued. Admin handles refunds manually on a case-by-case basis.
- Professors and Admins may cancel at any time; in this case the lesson is **not deducted** from the student's package.
- `cancelled_at` timestamp is stored on the lesson to enforce the 12-hour rule server-side.

### 4.2 Package Validity

| Package | Lessons | Validity |
|---|---|---|
| Single Class | 1 | No package — lesson must be booked at time of purchase |
| Starter Pack | 4 | 30 days from activation |
| Standard Pack | 8 | 60 days from activation |
| Premium Pack | 12 | 90 days from activation |

- Package activates immediately upon successful payment.
- Unused lessons expire at the end of the validity period (no automatic refund).
- Admin can manually extend a package's expiry date.

### 4.3 Per-Professor Pricing
- Each professor sets their own price per lesson type (single class, 4-pack, 8-pack, 12-pack).
- Prices are stored in `professor_pricing` and displayed to students during the purchase flow.
- When a student selects a professor, the prices shown are that professor's specific rates.

---

## 5. Database Schema

### users
```
id            UUID PK
email         VARCHAR UNIQUE NOT NULL
password_hash VARCHAR NOT NULL
name          VARCHAR NOT NULL
role          ENUM('student', 'professor', 'admin') NOT NULL
avatar_url    VARCHAR
created_at    TIMESTAMP DEFAULT NOW()
```

### packages
```
id            UUID PK
name          VARCHAR NOT NULL        -- e.g. "Starter Pack", "Standard Pack"
lesson_count  INT NOT NULL            -- 1, 4, 8, or 12
validity_days INT                     -- NULL for single class; 30, 60, 90 for packs
is_active     BOOLEAN DEFAULT TRUE
```
> Packages define structure only. Prices are set per professor in `professor_pricing`.

### professor_pricing
```
id              UUID PK
professor_id    UUID FK -> users
package_id      UUID FK -> packages
price           DECIMAL(10,2) NOT NULL
currency        VARCHAR(3) DEFAULT 'EUR'
is_active       BOOLEAN DEFAULT TRUE
```

### student_packages
```
id                UUID PK
student_id        UUID FK -> users
package_id        UUID FK -> packages
professor_id      UUID FK -> users      -- professor for whom the package was bought
transaction_id    UUID FK -> transactions
activated_at      TIMESTAMP
expires_at        TIMESTAMP
total_lessons     INT NOT NULL
used_lessons      INT DEFAULT 0
remaining_lessons INT GENERATED ALWAYS AS (total_lessons - used_lessons)
status            ENUM('active', 'expired', 'cancelled')
```

### professor_availability
```
id              UUID PK
professor_id    UUID FK -> users
day_of_week     INT                 -- 0=Monday ... 6=Sunday
start_time      TIME NOT NULL
end_time        TIME NOT NULL
is_recurring    BOOLEAN DEFAULT TRUE
specific_date   DATE                -- for one-off overrides
is_available    BOOLEAN DEFAULT TRUE
```

### lessons
```
id                  UUID PK
student_id          UUID FK -> users
professor_id        UUID FK -> users
student_package_id  UUID FK -> student_packages (nullable for single class)
scheduled_at        TIMESTAMP NOT NULL
duration_min        INT DEFAULT 60
status              ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled'
cancellation_type   ENUM('on_time', 'late', 'by_professor', 'by_admin')
cancelled_at        TIMESTAMP
is_paid             BOOLEAN DEFAULT FALSE
notes               TEXT
cancelled_reason    TEXT
created_at          TIMESTAMP DEFAULT NOW()
```

### transactions
```
id              UUID PK
student_id      UUID FK -> users
amount          DECIMAL(10,2) NOT NULL
currency        VARCHAR(3) NOT NULL
status          ENUM('pending', 'completed', 'failed', 'refunded')
payment_method  ENUM('paypal', 'card')
paypal_order_id VARCHAR
invoice_number  VARCHAR UNIQUE
reference_type  ENUM('package', 'single_lesson', 'course', 'group_class')
reference_id    UUID
created_at      TIMESTAMP DEFAULT NOW()
```

### video_courses
```
id              UUID PK
title           VARCHAR NOT NULL
description     TEXT
thumbnail_url   VARCHAR
language        VARCHAR
level           ENUM('beginner', 'intermediate', 'advanced')
price           DECIMAL(10,2) NOT NULL
currency        VARCHAR(3) DEFAULT 'EUR'
created_by      UUID FK -> users
is_published    BOOLEAN DEFAULT FALSE
created_at      TIMESTAMP DEFAULT NOW()
```

### course_modules
```
id              UUID PK
course_id       UUID FK -> video_courses
title           VARCHAR NOT NULL
order_index     INT NOT NULL
vimeo_video_id  VARCHAR NOT NULL   -- Vimeo numeric video ID (e.g. "123456789")
vimeo_url       VARCHAR            -- Full Vimeo URL (for reference/display)
duration_sec    INT                -- Video duration in seconds (from Vimeo API or manual)
```

### student_courses
```
id              UUID PK
student_id      UUID FK -> users
course_id       UUID FK -> video_courses
purchased_at    TIMESTAMP DEFAULT NOW()
transaction_id  UUID FK -> transactions
```

### student_module_progress
```
id              UUID PK
student_id      UUID FK -> users
module_id       UUID FK -> course_modules
watched_seconds INT DEFAULT 0
completed       BOOLEAN DEFAULT FALSE
last_watched_at TIMESTAMP
```

### group_classes
```
id              UUID PK
title           VARCHAR NOT NULL
professor_id    UUID FK -> users
scheduled_at    TIMESTAMP NOT NULL
duration_min    INT DEFAULT 60
max_students    INT DEFAULT 10
price           DECIMAL(10,2)
currency        VARCHAR(3) DEFAULT 'EUR'
status          ENUM('open', 'full', 'completed', 'cancelled')
```

### group_class_enrollments
```
id              UUID PK
class_id        UUID FK -> group_classes
student_id      UUID FK -> users
enrolled_at     TIMESTAMP DEFAULT NOW()
transaction_id  UUID FK -> transactions
```

---

## 6. Vimeo Video Hosting

### 6.1 Overview
All video course content is hosted on **Vimeo**. The platform does not store or serve video files directly — only Vimeo video IDs and URLs are stored in the database. Videos are rendered using the **Vimeo embedded player** (iframe).

### 6.2 Required Vimeo Account
- A **Vimeo Pro** or **Vimeo Business** account is required.
- These plans support:
  - Domain-level privacy (restricting embeds to specific domains)
  - Unlisted/private videos (not publicly searchable on Vimeo)
  - Sufficient storage and bandwidth for course content

### 6.3 Video Privacy & Security
To prevent students from sharing direct Vimeo links or accessing videos without purchasing:

| Setting | Configuration |
|---|---|
| Privacy | Set to **"Hide from Vimeo / Unlisted"** — not publicly searchable |
| Embed privacy | **"Specific domains only"** — whitelist the production domain (e.g. `yourdomain.com`) |
| Download | **Disabled** — students cannot download videos |
| Embeds | Enabled only from whitelisted domains |

> With domain-locked embeds, the Vimeo player will refuse to load on any other domain, including localhost (use a dev domain or Vimeo's embed exceptions for development).

### 6.4 Admin Workflow — Adding Videos
1. Admin (or professor) uploads the video directly to the Vimeo account dashboard.
2. Sets video privacy to **Unlisted** and restricts embeds to the school's domain.
3. Copies the **Vimeo video URL** (e.g. `https://vimeo.com/123456789`).
4. In the platform's admin panel (`/admin/courses`), pastes the URL into the module form.
5. The system automatically extracts the numeric **video ID** (`123456789`) and stores both `vimeo_video_id` and `vimeo_url` in the `course_modules` table.
6. Optionally fetches video duration via the **Vimeo API** to populate `duration_sec`.

### 6.5 Student Playback
- After purchasing a course, the student accesses it at `/dashboard/courses/[id]`.
- Each module renders an **iframe embed** using the Vimeo player URL:
  ```
  https://player.vimeo.com/video/{vimeo_video_id}?title=0&byline=0&portrait=0
  ```
- The player is rendered client-side in Next.js using a `<iframe>` component with lazy loading.
- Module progress (watched seconds, completion) is tracked via the **Vimeo Player SDK** `timeupdate` event and saved to `student_module_progress`.

### 6.6 Vimeo Player SDK Integration
- Use the official `@vimeo/player` npm package.
- Events to handle:
  - `timeupdate` → periodically save `watched_seconds` to DB (debounced, every 10s)
  - `ended` → mark module as `completed = true`
  - `pause` → save current position
- Player options: `autoplay: false`, `responsive: true`, `dnt: true` (do-not-track)

### 6.7 Vimeo API (Optional Enhancements)
The Vimeo API can be used to:
- **Fetch video metadata** (title, duration, thumbnail) automatically after URL is pasted
- **Validate** that the video ID exists and belongs to the school's account
- Endpoint: `GET https://api.vimeo.com/videos/{video_id}` (requires Bearer token)

Store the Vimeo API access token as an environment variable (`VIMEO_ACCESS_TOKEN`).

### 6.8 Environment Configuration
```env
VIMEO_ACCESS_TOKEN=your_vimeo_api_token
VIMEO_ALLOWED_DOMAIN=yourdomain.com
```

---

## 7. Application Routes & Pages

### Public Routes
| Route | Description |
|---|---|
| `/` | Landing page (features, pricing, testimonials) |
| `/courses` | Browse video courses |
| `/courses/[id]` | Course detail page |
| `/login` | Login page |
| `/register` | Student registration |

### Student Routes (authenticated, role: student)
| Route | Description |
|---|---|
| `/dashboard` | Student home overview |
| `/dashboard/profile` | Profile settings |
| `/dashboard/packages` | Browse & purchase — shows per-professor pricing |
| `/dashboard/packages/active` | Active package details |
| `/dashboard/book` | Book a lesson (select professor → time slot) |
| `/dashboard/lessons` | List of all scheduled/completed/cancelled lessons |
| `/dashboard/courses` | Purchased video courses |
| `/dashboard/courses/[id]` | Watch course (Vimeo embed + module progress) |
| `/dashboard/group-classes` | Browse & enroll in group classes |
| `/dashboard/transactions` | Transaction history |
| `/dashboard/transactions/[id]/invoice` | Download invoice PDF |

### Professor Routes (authenticated, role: professor)
| Route | Description |
|---|---|
| `/professor/dashboard` | Earnings summary + stats |
| `/professor/availability` | Manage weekly time slots |
| `/professor/pricing` | Manage own pricing per package type |
| `/professor/lessons` | List of all lessons |
| `/professor/lessons/[id]` | Lesson detail, add notes, cancel |
| `/professor/students` | Student list with filters |
| `/professor/students/[id]` | Individual student detail |

### Admin Routes (authenticated, role: admin)
| Route | Description |
|---|---|
| `/admin/dashboard` | KPI header |
| `/admin/transactions` | Filterable full transaction list |
| `/admin/lessons` | All lessons across professors |
| `/admin/students` | Student management |
| `/admin/students/[id]/extend-package` | Extend a student's package expiry |
| `/admin/professors` | Professor management |
| `/admin/professors/[id]/pricing` | View/override professor pricing |
| `/admin/courses` | Manage video courses + Vimeo module links |
| `/admin/group-classes` | Manage group classes |

---

## 8. Feature Specifications

### 8.1 Student — Lesson Purchase Options

| Option | Lessons | Validity | Price |
|---|---|---|---|
| Single Class | 1 | N/A — must book at purchase | Per professor |
| Starter Pack | 4 | 30 days | Per professor |
| Standard Pack | 8 | 60 days | Per professor |
| Premium Pack | 12 | 90 days | Per professor |

**Single Class flow:**
1. Student selects a professor → sees that professor's single class price
2. Selects an available time slot
3. PayPal payment → on success: lesson created (`is_paid = true`, `student_package_id = null`)
4. Transaction recorded with `reference_type = 'single_lesson'`

**Package flow:**
1. Student selects a professor → sees that professor's package prices
2. Selects a package → PayPal payment
3. On success: `student_packages` created, `activated_at = now()`, `expires_at = now() + validity_days`
4. Student books lessons against the active package

### 8.2 Student — Active Package Widget
Displayed only when student has an active package:
- Package name, professor name, activation date, expiry date
- Total lessons, used lessons, remaining lessons

### 8.3 Student — Booking a Lesson
1. Select professor → system fetches available slots
2. If active package for that professor → book at no extra charge
3. If no active package → prompted to buy single class or package

### 8.4 Cancellation Policy (12-Hour Rule)
- **≥ 12h before lesson** → free cancellation, not deducted from package
- **< 12h before lesson** → late cancellation, counts as used
- Enforced server-side: `scheduled_at - NOW() >= INTERVAL '12 hours'`
- Students see a warning when cancelling within the 12h window
- Professor/Admin cancellations → never deducted from student

### 8.5 Student — Lesson History Table
Columns: Date & Time | Duration | Professor | Paid | Status | Cancellation Type | Notes

### 8.6 Student — Transactions
Columns: Date | Status | Amount | Currency | Method (PayPal/Card)
- Download Invoice → PDF with invoice number, date, student info, item, amount, method

### 8.7 Student — Video Courses
- Browse catalog by language/level
- Purchase via PayPal
- Watch modules via Vimeo embedded player (see Section 6)
- Progress tracked per module

### 8.8 Professor — Pricing Management
- Set price per package type (Single, 4, 8, 12)
- Stored in `professor_pricing`
- Admin can override from `/admin/professors/[id]/pricing`

### 8.9 Professor — Time Slot Management
- Set recurring weekly availability
- Block specific dates
- Available slots = availability minus existing lessons

### 8.10 Professor Dashboard KPIs
- Total earnings | Total lessons | This month lessons | Monthly earnings
- Lesson list: student, date, duration, status

### 8.11 Admin Dashboard KPIs
Header cards: Total revenue | Active students | Total lessons | Monthly revenue

Per-professor: name | lessons this month | total lessons | earnings

Transaction filters: date range, payment method, status, student, professor

### 8.12 Admin — Extend Package
Select student → view active package → set new expiry date → confirm

### 8.13 PayPal Integration
- **PayPal Orders API v2**
- Flow: Create Order → PayPal redirect → Capture → Update DB
- Webhooks for async events
- `paypal_order_id` stored in transactions
- Sandbox support for development

---

## 9. Authentication & Authorization

- **NextAuth.js v5** with Credentials provider (email + password)
- JWT session strategy
- Role-based middleware protecting `/dashboard`, `/professor`, `/admin`
- Password hashing: bcrypt

---

## 10. Key API Endpoints (Next.js Route Handlers)

### Auth
- `POST /api/auth/[...nextauth]`

### Packages & Pricing
- `GET /api/packages` — list package types
- `GET /api/packages/pricing/[professorId]` — professor's prices for all package types
- `POST /api/packages/purchase` — initiate PayPal order for a package
- `POST /api/lessons/purchase-single` — PayPal order for single class + slot

### Lessons
- `GET /api/lessons` — student's lessons
- `POST /api/lessons/book` — book slot from active package
- `PATCH /api/lessons/[id]/cancel` — cancel (enforces 12h rule for students)
- `PATCH /api/lessons/[id]` — update notes/status (professor/admin)
- `GET /api/availability/[professorId]` — available slots

### Courses & Video
- `GET /api/courses` — public course list
- `POST /api/courses/purchase` — buy a course
- `GET /api/courses/[id]/modules` — modules with Vimeo data (purchased students only)
- `POST /api/courses/[id]/modules/[moduleId]/progress` — save watch progress
- `GET /api/vimeo/metadata?url=` — (admin) fetch Vimeo video metadata by URL

### Transactions
- `GET /api/transactions` — student's transactions
- `GET /api/transactions/[id]/invoice` — generate invoice PDF

### Admin
- `GET /api/admin/stats` — KPI data
- `GET /api/admin/transactions` — all transactions with filters
- `PATCH /api/admin/student-packages/[id]/extend` — extend package

### Professor
- `GET /api/professor/stats` — KPI data
- `GET /api/professor/students` — student list
- `POST /api/professor/availability` — set slots
- `DELETE /api/professor/availability/[id]` — remove slot
- `GET /api/professor/pricing` — get own pricing
- `PUT /api/professor/pricing` — update own pricing

### PayPal Webhooks
- `POST /api/webhooks/paypal`

---

## 11. Non-Functional Requirements

| Requirement | Detail |
|---|---|
| Security | HTTPS only, CSRF protection, rate limiting on auth endpoints |
| Performance | ISR for public pages, lazy loading for Vimeo embeds |
| Scalability | Stateless API, connection pooling (PgBouncer/Neon) |
| Accessibility | WCAG 2.1 AA; Vimeo player supports keyboard navigation |
| Localization | English UI, currency configurable per professor |
| Mobile | Fully responsive (Tailwind breakpoints); Vimeo player is responsive |

---

## 12. Development Phases

### Phase 1 — Foundation
- Project setup (Next.js 19, Tailwind, Prisma, PostgreSQL)
- Auth system (NextAuth.js, roles)
- Database schema + migrations (including `professor_pricing`, `student_module_progress`)
- Basic UI layout (header, nav, role-based routing)

### Phase 2 — Student Core
- Per-professor pricing display
- Single class + package purchase with PayPal
- Lesson booking (time slot selection)
- 12-hour cancellation policy enforcement
- Student dashboard (active package widget, lesson list, transactions)
- Invoice PDF generation

### Phase 3 — Professor Tools
- Pricing management UI
- Availability management (time slot CRUD)
- Professor dashboard (KPIs, lesson list, student overview)
- Lesson management (cancel, notes)

### Phase 4 — Admin Tools
- Admin dashboard (KPIs, per-professor breakdown)
- Transaction management with filters
- Package extension tool
- Professor pricing override

### Phase 5 — Video Courses & Group Classes
- Course catalog + purchase flow
- Vimeo embed player with `@vimeo/player` SDK
- Module progress tracking (`timeupdate`, `ended` events)
- Admin: course & module management (Vimeo URL paste → ID extraction)
- Group class listing, enrollment, and management

### Phase 6 — Polish & Launch
- Responsive QA across devices
- PayPal sandbox → production switch
- Vimeo domain whitelist configuration for production
- Performance optimization
- Security audit
