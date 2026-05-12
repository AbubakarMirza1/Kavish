# EcoDash

EcoDash is our final year project at Habib University under the project name `Kaavish`. It was built to help small and medium-sized enterprises (SMEs) in Pakistan track carbon emissions, manage waste more responsibly, and generate sustainability insights that are practical for day-to-day decision-making.

The core idea behind EcoDash is simple: many SMEs are expected to share environmental information internally and, in some cases, externally, but they usually do not have a lightweight digital system for recording emissions, organizing waste data, spotting patterns, or preparing presentable reports. EcoDash was designed as that bridge.

## Live Demo

Live application: [https://ecodash-client.onrender.com/](https://ecodash-client.onrender.com/)

To explore the system, a new user must first sign up or log in. EcoDash includes authentication-based route protection, so the dashboard and core application screens cannot be accessed without logging in first.

## Problem We Wanted to Solve

Pakistani SMEs often face a few connected challenges:

- Emissions data is scattered across departments or kept manually.
- Scope 1, Scope 2, and Scope 3 activities are not easy to consolidate.
- Waste is usually treated as disposal cost, not as a circular-economy opportunity.
- Sustainability reporting for management or outside institutions is time-consuming.
- Smaller firms rarely have dedicated ESG or data teams.

EcoDash addresses this by combining emissions data entry, dashboards, trend analysis, reporting, and waste-focused recommendations in one platform.

## What EcoDash Does

### 1. Carbon Emissions Tracking

EcoDash lets an organization record greenhouse gas activity across:

- Scope 1
  - Stationary combustion
  - Mobile sources
  - Refrigeration and AC
  - Fire suppression
  - Purchased gases
- Scope 2
  - Electricity
  - Steam
- Scope 3
  - Business travel
  - Waste

The system stores the activity data, calculates emissions using configured factors or pre-calculated values, and surfaces them in dashboards and KPI views.

### 2. Waste Management and Circular Economy Support

Waste is treated as more than just disposal. EcoDash tracks waste type, disposal method, weight, and associated emissions, then uses an analytics layer to:

- estimate diversion and recycling performance
- highlight circular-economy status
- suggest waste-focused improvement actions
- experiment with identifying Pakistani organizations that may recycle or use certain waste streams as raw material

This part of the project reflects the original FYP vision of connecting waste generators with possible downstream users and recyclers to support circular economy thinking.

### 3. Reporting

EcoDash can generate downloadable PDF sustainability reports for a selected date range. These reports are meant to help organizations:

- present emissions and waste performance in internal meetings
- share structured summaries with external institutions
- communicate trends, breakdowns, and improvement areas more professionally

The reporting pipeline includes tables, charts, narrative generation, and a preview/download flow in the frontend.

### 4. Insights and Forecasting

The dashboard and KPI screens show historical trends and future projections. In the current codebase, forecasting is implemented using linear regression over historical periods. This acts as the first practical forecasting layer for:

- emissions trends
- source-wise patterns
- waste generation trends
- diversion trends

The broader project vision includes more advanced machine learning for future emissions prediction and control planning. The current repository implements the foundation using statistical forecasting rather than a full separate ML training pipeline.

## End Users

EcoDash was designed primarily for:

- SMEs in Pakistan
- operations teams collecting activity data
- sustainability or compliance stakeholders
- management teams reviewing performance
- organizations preparing environmental reports for internal or external use

## Product Flow

At a high level, the platform works like this:

1. A company signs up and logs in through an OTP-based authentication flow.
2. After authentication, the user is allowed into the protected dashboard and application modules.
3. Users configure or select the reference categories needed for data entry.
4. Emissions and waste records are entered by source and date.
5. EcoDash aggregates the records into KPIs, charts, and trend views.
6. Waste analytics generate circular-economy observations and suggestions.
7. Users preview and export a PDF report for a reporting period.

## Repository Structure

```text
EcoDash/
|-- backend/
|   |-- prisma/
|   |   |-- schema.prisma
|   |   `-- migrations/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- seed/
|   |   |-- utils/
|   |   `-- server.js
|   `-- package.json
|-- frontend/
|   |-- public/
|   `-- src/
|       |-- Component/
|       |-- context/
|       |-- routing/
|       |-- screens/
|       |-- store/
|       `-- theme.js
|-- ERD.pdf
|-- WIREFRAMES.pdf
`-- README.md
```

## Tech Stack

### Frontend

- React 18
- React Router
- Material UI
- ApexCharts, Recharts, Chart.js, Highcharts
- Zustand for lightweight state management
- Axios
- Framer Motion and React Spring for UI effects

### Backend

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT authentication
- Nodemailer for OTP email delivery

### Analytics, Reporting, and Forecasting

- `simple-statistics` for regression-based trend prediction
- Google Gemini for narrative/report and waste-analytics assistance
- `pdfkit` and `pdf-lib` for PDF generation
- `chartjs-node-canvas` for server-side report charts

## System Design Overview

EcoDash follows a fairly standard full-stack web architecture:

- React frontend for forms, dashboards, analytics, and report preview
- Express API layer exposing routes for auth, CRUD, KPIs, analytics, and reports
- Prisma as the database access layer
- PostgreSQL as the persistent store
- CSV-based seeding for initial reference and demo data
- Gemini-assisted service modules for narrative and waste recommendation features

### Main Backend Modules

- `authRoutes` / `authcontroller`
  - signup, login, OTP verification, JWT issuance
- `scope1Routes`, `scope2Routes`, `scope3Routes`
  - CRUD flows for emissions and waste records
- KPI services
  - per-scope trend, totals, and source breakdowns
- `dashboardKPIsService`
  - consolidated organization-level overview
- `analyticsService`
  - circular-economy and waste recommendation layer
- `reportService`
  - report data aggregation, chart generation, narrative generation, PDF assembly

## Data Model

The Prisma schema organizes the platform around a `User`, `Role`, and `ScopeType` backbone.

### Core entities

- `User`
- `Role`
- `ScopeType`
- `Unit`
- `FuelType`
- `VehicleType`
- `EquipmentType`
- `WasteType`

### Emissions and waste entities

- `StationaryCombustion`
- `MobileSource`
- `RefrigerationAndAC`
- `FireSuppression`
- `PurchasedGas`
- `Electricity`
- `Steam`
- `BusinessTravel`
- `Waste`

This structure allows EcoDash to separate reference/master data from transactional sustainability records.

## Key Features Implemented in Code

### Emissions Management

- CRUD flows for Scope 1, 2, and 3 activity
- per-category data capture
- date-based record storage
- scope-wise summaries and breakdowns
- protected access after login/signup validation

### Dashboard and KPIs

- total emissions by scope
- top emission sources
- trend charts
- waste overview
- projected future trend lines using regression

### Waste Analytics

- waste by type
- waste trend and projected trend
- carbon footprint trend from waste
- diversion rate trend
- Gemini-assisted circular economy observations and suggestions

### Report Generation

- report preview in frontend
- PDF download
- chart embedding
- narrative sections
- emissions overview and waste metrics tables

## Setup and Running the Project

### Prerequisites

- Node.js
- npm
- PostgreSQL

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Kavish
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure environment variables

Create a `.env` file for the backend with values similar to:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_key
EMAIL_USER=your_email_account
EMAIL_PASS=your_email_app_password
FRONTEND_RENDER_URL=http://localhost:3000
PORT=4000
```

Create a `.env` file for the frontend with:

```env
REACT_APP_API_URL=http://localhost:4000
```

### 5. Run database migrations

```bash
cd backend
npx prisma migrate deploy
```

For local development, you can also use Prisma commands such as `migrate dev` if you are evolving the schema.

### 6. Seed demo/reference data

```bash
npm run seed
```

The seed process loads CSV files from `backend/src/seed/data`.

### 7. Start the backend

```bash
npm run dev
```

### 8. Start the frontend

```bash
cd ../frontend
npm start
```

Frontend will run on `http://localhost:3000` and backend on `http://localhost:4000` by default.

## Supporting Project Files

- `ERD.pdf`
  - entity relationship diagram for the database design
- `WIREFRAMES.pdf`
  - UI planning and interaction design references

These are useful if someone wants to understand the project from both design and implementation perspectives.

## Current Implementation Notes

This repository reflects an FYP prototype that grew into a fairly feature-rich working system. A few things are important for viewers to know:

- some screens and services still contain demo assumptions such as hardcoded sample user IDs
- forecasting is currently regression-based, not a full production-grade ML pipeline
- analytics quality depends heavily on the accuracy of entered waste data
- Gemini-powered features require a valid API key to work
- dashboard and internal modules are protected by authentication, so unauthenticated users cannot directly enter the app
- the project is strongest as a prototype and research/portfolio system, with clear room for production hardening

## Future Improvements

If EcoDash were taken further beyond the FYP stage, the next major improvements would be:

- remove all hardcoded demo user assumptions and complete multi-tenant user binding
- strengthen authentication, authorization, and route protection across the app
- add a proper machine learning or time-series forecasting pipeline
- integrate more localized Pakistani emission factors and sector-specific benchmarks
- build a stronger verified recycler/buyer discovery workflow for circular-economy matching
- support CSV/Excel bulk uploads for SMEs
- add audit trails, approvals, and versioned reporting
- improve report compliance mapping for formal regulatory or framework-based disclosure
- add automated integrations with utility bills, travel systems, or ERP data sources
- expand testing and deployment automation

## Why This Project Matters

EcoDash was built around a practical belief: sustainability tooling should not only be available to large enterprises. SMEs also need accessible systems to understand their environmental impact, manage waste better, and communicate their progress. For the Pakistani context especially, a tool like EcoDash can help organizations begin their sustainability journey with structure instead of spreadsheets and guesswork.

## Acknowledgment

This project was developed as our final year project at Habib University under the name `Kaavish`. It represents both a technical system and a sustainability-focused problem-solving effort aimed at making emissions tracking and circular-economy thinking more accessible for businesses in Pakistan.
