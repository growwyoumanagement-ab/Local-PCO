# Local PCO

## Your workday, connected.

**Local PCO** is a purpose-built field operations platform for home-service partners and local specialists — including technicians, electricians, plumbers, cleaners, pest control operators, and appliance repair professionals.

The platform connects service specialists with client bookings in real time and guides them through the complete job lifecycle:
**Job Broadcast → Accept Job → Navigate → Start Job → Execute Service → Upload Photo Proof → Complete Job → Track Earnings → Bank Payout**.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Core Workflow](#core-workflow)
- [Key Features](#key-features)
- [Service Partner Experience](#service-partner-experience)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Directory Structure](#project-directory-structure)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Build & Release](#build--release)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Troubleshooting](#troubleshooting)

---

## 🌟 Overview

Local PCO helps field specialists manage incoming jobs, execute field work efficiently, submit photo proof of completion, and receive payouts from one unified operational workspace.

### Core Value Proposition

- **Operational Clarity**: High-density, scannable job cards with explicit pricing, distance, and client instructions.
- **Zero Ambiguity State Machine**: Explicit transitions (`accepted` ➔ `reached` ➔ `in_progress` ➔ `completed`) prevent stalled or uncertain job states.
- **Visual Work Verification**: Mandatory before/after photo proof capture with in-app camera integration and immediate thumbnail confirmation.
- **Transparent Partner Ledger**: Real-time earnings summaries (Today, Weekly, Monthly) and direct OTP-authenticated bank withdrawals.

---

## 🔄 Core Workflow

```
[ Client Booking Created ]
           │
           ▼
[ Real-Time Broadcast to Nearby Partners ]
           │
    ┌──────┴─────────────────────────┐
    ▼                                ▼
[ Decline ]                  [ Accept Job (30s Timer) ]
                                     │
                                     ▼
                            [ Start Navigation ]
                                     │
                                     ▼
                           [ Reached Client Site ]
                                     │
                                     ▼
                              [ Start Service ]
                                     │
                                     ▼
                          [ Upload Photo Proof ]
                                     │
                                     ▼
                           [ Complete Service ]
                                     │
                                     ▼
                        [ Instant Settlement Credit ]
                                     │
                                     ▼
                        [ Direct Bank Account Payout ]
```

---

## ⚡ Key Features

### 1. Job Broadcast & 30-Second Acceptance
- Live push and WebSocket broadcast alerts to qualified partners within the service radius.
- Complete preview of service category, address, client notes, estimated duration, and guaranteed payout amount.

### 2. Field Navigation & Execution
- Turn-by-turn routing shortcuts to customer premises.
- Automatic arrival notifications sent to the client upon partner check-in.
- Active work timer keeping track of ongoing job duration.

### 3. In-App Photo Proof
- Camera capture and gallery image selection via `expo-image-picker`.
- Automatic image optimization to prevent memory overhead on field devices.
- Image previews with remove/retry options before final submission.

### 4. Financial Ledger & Bank Settlements
- Live wallet balance updated instantly on job sign-off.
- Period filters: Today, This Week, This Month.
- Bank account management with IFSC verification.
- Two-factor OTP authorization before initiating payouts.

### 5. Operations Command Center (Admin / Verifiers)
- Centralized partner verification queue (Aadhaar, PAN, Skill certificates).
- Service catalog management (categories, pricing tiers, commission settings).
- Live booking monitor and partner dispatch oversight.

---

## 📱 Service Partner Experience

The interface is engineered around the motto: **“I opened this because I have a job to do.”**
- **Outdoor Readability**: High-contrast typography and clear status indicators readable in direct sunlight.
- **Large Touch Targets**: Minimized precision tapping for workers wearing gloves or in motion.
- **Contextual Actions**: The next operational step is always the prominent primary button on screen.
- **Resilient Connectivity**: Dual-cluster failover and local persistence so network fluctuations in the field never lose work data.

---

## 🏛️ System Architecture

```
                                  +---------------------------------------+
                                  |         Local PCO Ecosystem           |
                                  +-------------------+-------------------+
                                                      |
                 +------------------------------------+------------------------------------+
                 |                                    |                                    |
                 v                                    v                                    v
   +---------------------------+        +---------------------------+        +---------------------------+
   |   Partner Mobile App      |        |   Operations Command      |        |   Informative Landing     |
   |   (React Native / Expo)   |        |   (React 18 / Vite / TS)  |        |   (React 19 / Vite / TW)  |
   +-------------+-------------+        +-------------+-------------+        +-------------+-------------+
                 |                                    |                                    |
                 +------------------------------------+------------------------------------+
                                                      |
                                                      v
                                        +---------------------------+
                                        |    Local PCO REST & WS    |
                                        |    Backend API (Express)  |
                                        +-------------+-------------+
                                                      |
                         +----------------------------+----------------------------+
                         |                                                         |
                         v                                                         v
           +---------------------------+                             +---------------------------+
           |     MongoDB Database      |                             |    Cloudinary Media CDN   |
           |     (Primary Cluster)     |                             |    (Photo Proofs & Docs)  |
           +---------------------------+                             +---------------------------+
```

---

## 💻 Tech Stack

| Layer | Technologies |
|---|---|
| **Partner App** | React Native 0.81.5, Expo SDK 54, TypeScript, Redux Toolkit, Redux Persist, Socket.io-client, Expo Image Picker |
| **Client App** | React Native 0.81.5, Expo SDK 54, TypeScript, React Native Maps, Redux Toolkit |
| **Admin Portal** | React 18, Vite, TypeScript, Tailwind CSS, Radix UI, TanStack Table, Recharts, Lucide Icons |
| **Informative Site** | React 19, Vite 8, Tailwind CSS 4, Framer Motion, Lucide Icons |
| **Backend API** | Node.js, Express 5, MongoDB / Mongoose, Socket.io 4, Cloudinary, JWT, Nodemailer, Winston |

---

## 📁 Project Directory Structure

```
local-pco/
├── informative/             # Public landing & informative platform (Vite + React 19)
│   ├── src/
│   │   ├── components/      # Reusable UI components (Navbar, Footer, Buttons)
│   │   └── sections/        # Operational feature showcases & app download
│   └── public/              # Brand assets, icons, robots.txt, sitemap.xml
│
├── partner/Local-Pco-Pr/    # Partner Field Operations mobile & web app (Expo SDK 54)
│   ├── src/
│   │   ├── components/      # JobCard, IncomingRequestModal, StatusBadge, etc.
│   │   ├── navigation/      # Bottom tabs & stack navigators
│   │   ├── screens/         # Dashboard, JobExecution, JobRequest, Wallet, KYC
│   │   ├── services/        # API clients (jobService, socketService, walletService)
│   │   ├── store/           # Redux slices (jobSlice, partnerSlice, authSlice)
│   │   └── utils/           # Brand color tokens, status constants, helpers
│   └── assets/              # App icons, splash screens, brand marks
│
├── client/Local-Pco-Client/ # Customer booking mobile & web app (Expo SDK 54)
│   ├── src/                 # Screens, navigators, store, and services
│   └── assets/              # Icons and splash graphics
│
├── admin/                   # Operations command center & admin portal (Vite + React 18)
│   ├── src/
│   │   ├── components/      # Sidebar, VerifierSidebar, Topbar, Data Tables
│   │   ├── pages/           # Dashboard, VerificationQueue, Partners, Bookings
│   │   └── services/        # Axios API client & endpoints
│   └── public/              # Admin logo, favicon
│
└── backend/                 # Core REST API server & WebSocket dispatcher
    ├── src/
    │   ├── config/          # Database, Swagger, and Cloudinary configuration
    │   ├── controllers/     # Auth, Job, Partner, Client, Wallet, Admin controllers
    │   ├── models/          # MongoDB schemas (User, Partner, ServiceRequest, etc.)
    │   ├── routes/          # Express route endpoints (/api/v1)
    │   ├── services/        # Socket dispatchers, notification handlers
    │   └── utils/           # JWT, emailService, logger
    ├── seedAdmin.js         # Bootstrap admin account
    └── seedVerifier.js      # Bootstrap verification team account
```

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js**: v18 or later
- **npm** or **yarn**
- **MongoDB**: Local instance running on `localhost:27017` or MongoDB Atlas URI
- **Expo Go** app (optional, for running partner mobile app on device)

### 1. Start Backend API
```bash
cd backend
npm install
npm run dev
# Server listens on http://localhost:5000
```

### 2. Start Admin Command Center
```bash
cd admin
npm install
npm run dev
# Portal opens on http://localhost:5173
```

### 3. Start Informative Landing Platform
```bash
cd informative
npm install
npm run dev
# Landing site opens on http://localhost:5174
```

### 4. Start Partner Mobile App
```bash
cd partner/Local-Pco-Pr
npm install
npx expo start
# Press 'w' for web preview, or scan QR with Expo Go on Android/iOS
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/local-pco
JWT_SECRET=your_jwt_secret_key
REFRESH_TOKEN_SECRET=your_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FROM_EMAIL="Local PCO" <noreply@localpco.com>
```

### Admin (`admin/.env`)
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Partner App (`partner/Local-Pco-Pr/.env`)
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## 📜 Available Scripts

### Backend
- `npm run dev`: Start Express API server with nodemon auto-restart.
- `npm start`: Start Express in production mode.
- `npm test`: Run Jest automated test suites.
- `npm run seed:proper`: Seed realistic services and initial catalog data.

### Admin
- `npm run dev`: Start Vite development server.
- `npm run build`: Typecheck with `tsc -b` and compile production bundle.
- `npm run lint`: Run ESLint checks.

### Informative Site
- `npm run dev`: Start Vite development server.
- `npm run build`: Compile static production build with Vite 8.

### Partner App
- `npx expo start`: Start Metro bundler.
- `npx expo start --web`: Launch partner operations interface in web browser.

---

## 🏗️ Build & Release

### Web Portals
```bash
# Build Informative Site
cd informative && npm run build

# Build Admin Portal
cd admin && npm run build
```

### Partner Android APK
```bash
cd partner/Local-Pco-Pr
npx eas build -p android --profile preview
```

---

## 🧪 Testing & Quality Assurance

- **Unit & Integration Tests**: `npm --prefix backend test`
- **End-to-End Test Suite**: `node backend/tests/run-all-tests.js`
- **TypeScript Typechecks**:
  - `npm --prefix admin run build` (`tsc -b`)
  - `npx --prefix partner/Local-Pco-Pr tsc --noEmit`
  - `npx --prefix client/Local-Pco-Client tsc --noEmit`

---

## 🔧 Troubleshooting

1. **Metro Bundler Port Conflict**:
   If port 8081 is in use, start with `npx expo start --port 8082`.
2. **Socket.io Connection in Field**:
   Ensure `EXPO_PUBLIC_API_URL` points to an externally reachable IP or production HTTPS endpoint.
3. **Camera & Storage Permissions**:
   Verify camera permissions on the mobile device when capturing proof images.

---

Proprietary — © **Local PCO Technologies**. All rights reserved.
