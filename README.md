# Leave Management & Employee HR System

A MERN implementation of the assignment requirement: a dark SaaS-style HRMS focused on employee master data, leave lifecycle, holiday rules, financial-year leave balances, and admin approval workflows.

## Tech Stack

- Frontend: Vite, React, React Router, Tailwind CSS
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT in httpOnly cookies, bcrypt password hashing, role-based middleware
- Deployment target: Vercel for `client`, Render for `server`, MongoDB Atlas for database

## Demo Credentials

After running the seed script:

| Role | Email | Company ID | Password |
| --- | --- | --- | --- |
| Admin | `info@magicalabs.com` | `ADMIN001` | `Admin@123` |
| Employee | `arjun@magicalabs.com` | `EMP001` | `Employee@123` |
| Employee | `neha@magicalabs.com` | `EMP002` | `Employee@123` |
| Employee | `rahul@magicalabs.com` | `EMP003` | `Employee@123` |

## Local Setup

1. Install dependencies:

```bash
npm install
npm --prefix server install
npm --prefix client install
```

2. Create environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Set `MONGO_URI` in `server/.env`.

4. Seed the database:

```bash
npm run seed
```

5. Start the full app:

```bash
npm run dev
```

The frontend runs on `http://localhost:5173`; the backend runs on `http://localhost:5000`.

On Windows PowerShell, if script execution blocks `npm`, use `npm.cmd` instead.

## Core Features

- Login with email, company ID, and password
- Admin and employee dashboards
- Employee leave application with Sunday, holiday, notice-period, duplicate-date, and quota checks
- Pending leave treated as reserved during quota checks
- Admin approval/rejection workflow
- Automatic CL/LOP assignment
- Financial year tracking from April to March
- Employee master data with masked PAN and bank details in normal views
- Profile update and password change
- Holiday management with duplicate date/location protection
- Monthly calendar with priority: Holiday, Approved Leave, Sunday, Present

## Deployment Notes

### Backend on Render

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables:
  - `MONGO_URI`
  - `JWT_SECRET`
  - `CLIENT_URL`
  - `COOKIE_SECURE=true`

### Frontend on Vercel

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable:
  - `VITE_API_BASE_URL=https://your-render-service.onrender.com/api`

## Demo Video Script

1. Log in as employee `arjun@magicalabs.com`.
2. Show dashboard totals, upcoming holidays, and monthly calendar.
3. Apply a full-day leave and show validation feedback.
4. Open leave history and confirm the request is `APPLIED`.
5. Log out and log in as admin.
6. Open Admin Panel, review pending leave requests, and approve the request.
7. Return to the calendar and dashboard to show the approved leave and updated balance.
8. Open Profile to show employee master data and masked sensitive fields.

## Bonus Features for Future Work

- Email notifications
- Google login
- Analytics dashboard
- Export reports
