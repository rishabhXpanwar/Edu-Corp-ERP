# 🎓 Edu-Corp ERP

> A comprehensive **Educational Resource Planning (ERP) System** designed for modern schools — managing academics, administration, finance, HR, communication, and more in one unified platform.

🌐 **Live Demo**: [https://black-smoke-035ba8700.6.azurestaticapps.net](https://black-smoke-035ba8700.6.azurestaticapps.net)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo & Test Credentials](#-live-demo--test-credentials)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [User Roles](#-user-roles)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)
- [Database Models](#-database-models)
- [Security](#-security)
- [Contributing](#-contributing)

---

## 🌟 Overview

Edu-Corp ERP is a **full-stack, multi-tenant school management system** that provides a unified platform for all stakeholders in an educational institution — principals, teachers, students, parents, and administrative staff. It combines academic management, HR, finance, and real-time communication into a single, role-aware interface.

**Key Highlights:**
- 🏫 **Multi-tenant architecture** — each school operates in an isolated environment
- 🔐 **9 distinct user roles** with fine-grained permissions
- 📊 **Real-time dashboards** with charts and analytics
- 📡 **Live notifications** via WebSockets (Socket.io)
- 📧 **Automated emails & SMS** for events and alerts
- 📄 **PDF report cards** generated on-demand
- ☁️ **Cloud file storage** via Cloudinary

---

## 🚀 Live Demo & Test Credentials

| Field | Value |
|-------|-------|
| **Live URL** | [https://black-smoke-035ba8700.6.azurestaticapps.net](https://black-smoke-035ba8700.6.azurestaticapps.net) |
| **Role** | Principal |
| **Email** | `principal@springfield.test` |
| **Password** | `Password123!` |

> ⚠️ **Note:** These are testing credentials for demonstration purposes. Do not use real personal data in the demo environment.

---

## ✨ Features

### 🎓 Academic Management
- **Class & Section Management** — create classes, sub-sections, assign class teachers
- **Timetable Scheduling** — build weekly timetables per class/section
- **Exam Management** — schedule exams, build datesheets, track status
- **Marks & Grading** — enter subject-wise marks, auto-calculate grades and ranks
- **Report Cards** — generate and download PDF report cards per student
- **Assignments** — create, distribute, and track assignment submissions
- **Academic Calendar** — schedule and view school-wide events

### 👥 People Management
- **Student Admission** — enroll students, manage profiles, link parents
- **Teacher Profiles** — manage teacher data, subject assignments, salary info
- **Manager Accounts** — HR, Finance, Academic, and Admin managers
- **Parent Accounts** — parents can view their child's progress

### 📅 Attendance & Leave
- **Daily Attendance** — mark attendance per section, generate reports
- **Leave Requests** — employees submit leave requests; principals/managers approve or reject

### 💰 Finance
- **Fee Management** — track student fee dues, mark payments, view status
- **Salary Management** — manage teacher payroll: base salary, deductions, monthly status

### 📚 Support Services
- **Library Management** — catalog books, track copies and availability
- **Transport Management** — define routes, stops, and assign students to routes

### 📢 Communication
- **Announcements** — broadcast school-wide or role-specific announcements
- **Notifications** — real-time in-app notifications via WebSockets
- **Email & SMS Alerts** — automated Nodemailer + Twilio integrations

### 🛡️ System & Security
- **Audit Logs** — track all critical actions for compliance
- **School Settings** — configure school profile, logo, contact info
- **Subscription Management** — SuperAdmin manages school plans and billing
- **Rate Limiting & Helmet** — API hardening and brute-force protection

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | LTS | Runtime |
| **Express.js** | v5.2 | Web framework |
| **MongoDB** | - | Primary database |
| **Mongoose** | v9.3 | ODM for MongoDB |
| **Socket.io** | v4.8 | Real-time WebSocket communication |
| **JWT** | v9.0 | Authentication tokens |
| **bcryptjs** | - | Password hashing |
| **Nodemailer** | v8.0 | Email delivery |
| **Twilio** | v5.1 | SMS notifications |
| **PDFKit** | v0.18 | PDF report card generation |
| **Cloudinary** | - | Cloud media storage |
| **Multer** | v2.1 | File upload middleware |
| **Helmet.js** | v8.1 | HTTP security headers |
| **express-rate-limit** | v8.3 | API rate limiting |
| **express-validator** | v7.3 | Input validation |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | v19 | UI framework |
| **Vite** | v8.0 | Build tool & dev server |
| **Redux Toolkit** | v2.1 | Global state management |
| **React Router** | v7.1 | Client-side routing |
| **Axios** | v1.1 | HTTP client |
| **React Hook Form** | v7.7 | Form state management |
| **Zod** | v4.3 | Schema-based form validation |
| **Recharts** | v3.8 | Data visualization & charts |
| **Framer Motion** | v12 | Animations & transitions |
| **Socket.io Client** | v4.8 | Real-time client |
| **Lucide React** | v0.5 | Icon library |
| **react-hot-toast** | v2.6 | Toast notifications |

---

## 👤 User Roles

Edu-Corp ERP supports **9 distinct roles** with permission-scoped dashboards:

| Role | Description |
|------|-------------|
| `superAdmin` | Platform administrator; manages all schools and subscriptions |
| `principal` | School head; full access to school data, staff, and reports |
| `academicManager` | Manages academics: classes, exams, timetables, assignments |
| `financeManager` | Handles fees, salaries, and financial reports |
| `hrManager` | Manages leave requests, teacher profiles, HR records |
| `adminManager` | Administrative support: notices, calendar, general settings |
| `teacher` | Marks attendance, enters grades, views timetable |
| `student` | Views own results, timetable, assignments, notices |
| `parent` | Tracks child's attendance, results, fee status, and notices |

---

## 📁 Project Structure

```
Edu-Corp-ERP/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── features/           # Feature modules (22 modules)
│   │   │   ├── auth/
│   │   │   ├── schools/
│   │   │   ├── students/
│   │   │   ├── teachers/
│   │   │   ├── classes/
│   │   │   ├── attendance/
│   │   │   ├── timetable/
│   │   │   ├── exams/
│   │   │   ├── marks/
│   │   │   ├── reportCards/
│   │   │   ├── assignments/
│   │   │   ├── fees/
│   │   │   ├── salaries/
│   │   │   ├── leave/
│   │   │   ├── library/
│   │   │   ├── transport/
│   │   │   ├── notifications/
│   │   │   ├── announcements/
│   │   │   ├── calendar/
│   │   │   ├── audit/
│   │   │   ├── settings/
│   │   │   └── subscriptions/
│   │   ├── models/             # 21 Mongoose schemas
│   │   ├── middleware/         # Auth, role guards, rate limiting
│   │   ├── socket/             # Socket.io handlers
│   │   ├── utils/              # Helpers: email, SMS, PDF, cloud
│   │   └── app.js              # Express app entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/                   # React + Vite SPA
    ├── src/
    │   ├── features/           # Feature modules (27 modules)
    │   │   ├── auth/
    │   │   ├── landing/
    │   │   ├── superadmin/
    │   │   ├── dashboard/
    │   │   ├── students/
    │   │   ├── teachers/
    │   │   ├── classes/
    │   │   ├── attendance/
    │   │   ├── timetable/
    │   │   ├── exams/
    │   │   ├── marks/
    │   │   ├── results/
    │   │   ├── reportCards/
    │   │   ├── assignments/
    │   │   ├── fees/
    │   │   ├── salaries/
    │   │   ├── leave/
    │   │   ├── library/
    │   │   ├── transport/
    │   │   ├── notifications/
    │   │   ├── announcements/
    │   │   ├── calendar/
    │   │   ├── audit/
    │   │   ├── settings/
    │   │   ├── profile/
    │   │   └── managers/
    │   ├── components/         # Reusable UI components
    │   ├── layouts/            # Page layout wrappers
    │   ├── router/             # App routing (AppRouter.jsx)
    │   ├── store/              # Redux store & slices
    │   ├── hooks/              # Custom React hooks
    │   ├── utils/              # Utility functions
    │   └── constants/          # Roles, config constants
    ├── .env.example
    └── package.json
```

---

## 🚦 Getting Started

### Prerequisites
- **Node.js** v18+ 
- **MongoDB** (local instance or MongoDB Atlas cluster)
- **npm** v9+

### 1. Clone the Repository

```bash
git clone https://github.com/rishabhXpanwar/Edu-Corp-ERP.git
cd Edu-Corp-ERP
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration (see Environment Variables section)
npm run dev
```

The API server starts at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api/v1
npm run dev
```

The frontend dev server starts at `http://localhost:5173`

### 4. Seed Database (Optional)

```bash
cd backend
npm run seed
```

This populates the database with sample schools, users, classes, and academic data for testing.

---

## 🔧 Environment Variables

### Backend `.env`

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/edu-corp-erp

# JWT Secrets
JWT_ACCESS_SECRET=your_access_token_secret_here
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CLIENT_URL=http://localhost:5173

# Cloudinary (File/Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Twilio (SMS Notifications)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Nodemailer (Email)
NODEMAILER_HOST=smtp.gmail.com
NODEMAILER_PORT=587
NODEMAILER_USER=your_email@gmail.com
NODEMAILER_PASS=your_app_password
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## 📡 API Overview

All endpoints are prefixed with `/api/v1`.

| Prefix | Module | Description |
|--------|--------|-------------|
| `/auth` | Authentication | Login, register, refresh token, OTP |
| `/schools` | Schools | School CRUD, multi-tenant management |
| `/subscriptions` | Subscriptions | Plans, billing (SuperAdmin only) |
| `/users` | Users | User management, role assignment |
| `/classes` | Classes | Class and section management |
| `/students` | Students | Student admission and profiles |
| `/attendance` | Attendance | Daily attendance records |
| `/timetable` | Timetable | Class schedule management |
| `/exams` | Exams | Exam scheduling and datesheets |
| `/marks` | Marks | Grade entry and calculations |
| `/report-cards` | Report Cards | PDF report card generation |
| `/assignments` | Assignments | Assignment creation and tracking |
| `/fees` | Fees | Student fee tracking |
| `/salaries` | Salaries | Payroll management |
| `/leave` | Leave | Leave request workflow |
| `/library` | Library | Book catalog management |
| `/transport` | Transport | Routes and student assignment |
| `/notifications` | Notifications | In-app notification system |
| `/announcements` | Announcements | School-wide announcements |
| `/calendar` | Calendar | Academic events |
| `/audit` | Audit Logs | Compliance and action tracking |
| `/settings` | Settings | School configuration |
| `/health` | Health Check | Server status (no auth required) |

### Authentication

All protected routes require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <your_access_token>
```

Tokens are obtained via `POST /api/v1/auth/login` and refreshed via `POST /api/v1/auth/refresh-token`.

---

## 🗄️ Database Models

Edu-Corp ERP uses **21 MongoDB schemas** via Mongoose:

| Model | Purpose |
|-------|---------|
| `User` | Central entity for all roles (principal, teacher, student, parent, etc.) |
| `School` | Multi-tenant school record |
| `Class` | Class definitions per academic year |
| `Section` | Sub-sections within a class |
| `AcademicYear` | Tracks academic sessions |
| `Exam` | Exam scheduling and datesheet |
| `Marks` | Subject-wise marks per student per exam |
| `Attendance` | Daily attendance records per section |
| `Fee` | Student fee tracking |
| `Salary` | Teacher payroll records |
| `LeaveRequest` | Employee leave requests |
| `Timetable` | Weekly class schedules |
| `Assignment` | Homework and project assignments |
| `CalendarEvent` | Academic events |
| `Announcement` | School announcements |
| `Notification` | In-app notifications |
| `LibraryBook` | Library catalog |
| `Transport` | Transport routes and stops |
| `AuditLog` | System audit trail |
| `Subscription` | School subscription plans |

---

## 🔒 Security

Edu-Corp ERP implements multiple layers of security:

- **JWT Authentication** — short-lived access tokens + refresh token rotation
- **Role-Based Access Control** — every endpoint is guarded by role middleware
- **School Scoping** — users can only access data within their own school
- **Helmet.js** — sets secure HTTP headers (XSS protection, HSTS, etc.)
- **Rate Limiting** — prevents brute-force and DDoS attacks
- **Input Validation** — all inputs sanitized via `express-validator` (backend) and `Zod` (frontend)
- **Password Hashing** — `bcryptjs` with salt rounds
- **CORS** — restricted to allowed origins only
- **Suspension Check** — middleware blocks suspended/inactive accounts

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

### Code Style
- Backend: ESLint + Prettier (see `.eslintrc` in `/backend`)
- Frontend: ESLint + Prettier (see `.eslintrc` in `/frontend`)

Run linting with:
```bash
npm run lint
```

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">
  <p>Built with ❤️ for modern educational institutions</p>
  <p>
    <a href="https://black-smoke-035ba8700.6.azurestaticapps.net">🌐 Live Demo</a>
  </p>
</div>
