# 🛠️ Local PCO — Partner Mobile App

[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2054-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.0.1-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8.3-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io)
[![Sentry](https://img.shields.io/badge/Sentry-Monitoring-362D59?style=for-the-badge&logo=sentry&logoColor=white)](https://sentry.io)

> Production-grade, cross-platform mobile application for service professionals on the **Local PCO** on-demand platform. Built on **Expo SDK 54**, **React Native 0.81.5**, and **TypeScript**, engineered for high reliability, real-time job dispatching, live GPS presence tracking, KYC document verification, digital wallet settlements, and resilient dual-backend failover.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Navigation Hierarchy & Screens Catalog](#-navigation-hierarchy--screens-catalog)
- [Core Business Workflows](#-core-business-workflows)
  - [1. Authentication & Onboarding](#1-authentication--onboarding)
  - [2. Availability & Real-Time Presence](#2-availability--real-time-presence)
  - [3. Job Dispatch & 30-Second Acceptance](#3-job-dispatch--30-second-acceptance)
  - [4. Four-Stage Job Execution Lifecycle](#4-four-stage-job-execution-lifecycle)
  - [5. KYC Verification & In-App Cropping](#5-kyc-verification--in-app-cropping)
  - [6. Wallet, Bank Accounts & Payouts](#6-wallet-bank-accounts--payouts)
  - [7. Resilient Dual-Backend Failover](#7-resilient-dual-backend-failover)
- [State Management Architecture](#-state-management-architecture)
- [Real-Time WebSocket & Push Notification Protocols](#-real-time-websocket--push-notification-protocols)
- [Configuration & Environment Variables](#-configuration--environment-variables)
- [Developer Quickstart & Local Setup](#-developer-quickstart--local-setup)
- [Build & Release Pipelines (EAS)](#-build--release-pipelines-eas)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🌟 Overview

The **Local PCO Partner App** (`com.localpco.partner`) is the field operations tool used by service partners (technicians, plumbers, electricians, cleaners, pest control experts, and home repair professionals). It connects service specialists with client bookings in real-time, guiding partners from job broadcast to execution, photo proof submission, and bank payout.

### Key Capabilities

- **Real-Time Job Dispatch**: Audio-visual notifications with an animated 30-second countdown timer and distance/earning previews.
- **GPS Location Streaming**: Automated background/foreground location updates emitted to backend sockets every 10 seconds / 10 meters when online.
- **Structured 4-Stage Job State Machine**: Strictly audited status transitions (`accepted` ➔ `reached` ➔ `in_progress` ➔ `completed`).
- **Proof-of-Work Verification**: Camera integration with automatic image resizing (1024px) and JPEG compression to eliminate Android memory overhead.
- **In-App Document Cropping**: Proprietary `DocumentCropModal` for aspect-ratio adjusted capture of Aadhaar (front/back), PAN, driving licenses, and passbooks.
- **Financial Ledger & Payouts**: Real-time wallet balance, earnings filter (Today, Weekly, Monthly), bank account binding with OTP authorization, and withdrawal processing.
- **High-Availability Network Resilience**: Automatic transparent failover between primary and backup Render clusters on network or 5xx server faults.

---

## 🏛️ System Architecture

```
                                  +---------------------------------------+
                                  |     Local PCO Partner App       |
                                  |         (Expo SDK 54 / RN)            |
                                  +-------------------+-------------------+
                                                      |
                         +----------------------------+----------------------------+
                         |                                                         |
                         v                                                         v
          +------------------------------+                          +------------------------------+
          |     Redux Toolkit Store      |                          |     WebSocket & Push Layer   |
          |  - authSlice (Persisted)     |                          |  - Socket.io (Auto-reconnect)|
          |  - partnerSlice (Persisted)  |                          |  - Firebase Cloud Messaging  |
          |  - jobSlice (Active State)   |                          |  - Live GPS WatchPosition    |
          |  - walletSlice (Financials)  |                          +--------------+---------------+
          +--------------+---------------+                                         |
                         |                                                         |
                         v                                                         |
          +------------------------------+                                         |
          |   Secure Storage / Tokens    |                                         |
          |  - expo-secure-store (AES)   |                                         |
          |  - AsyncStorage Fallback     |                                         |
          +--------------+---------------+                                         |
                         |                                                         |
                         +----------------------------+----------------------------+
                                                      |
                                                      v
                                      +-------------------------------+
                                      |     Axios HTTP Interceptor    |
                                      |   - Bearer Token Injection    |
                                      |   - 401 Queue Refresh         |
                                      |   - Dual-Backend Failover     |
                                      +---------------+---------------+
                                                      |
                                      +---------------+---------------+
                                      |                               |
                                      v                               v
                       +-----------------------------+ +-----------------------------+
                       |   Primary Render Backend    | |   Fallback Render Backend   |
                       | local-pco.onrender.com   | | local-pco-5g5i...com     |
                       +-----------------------------+ +-----------------------------+
```

---

## 💻 Technology Stack

| Layer | Technology | Version | Purpose / Highlights |
| :--- | :--- | :--- | :--- |
| **Framework** | Expo SDK | `^54.0.0` | Managed workflow, custom config plugins, hermes engine |
| **Runtime** | React Native | `0.81.5` | Native mobile bridging and modern layout engine |
| **Core Library** | React | `19.1.0` | React 19 Concurrent rendering & modern hook lifecycles |
| **Language** | TypeScript | `^5.3.3` | End-to-end static typing across models, routes, slices |
| **State Management** | Redux Toolkit | `^2.0.1` | Predictable state container with createSlice & async thunks |
| **Persistence** | Redux Persist | `^6.0.0` | Offline state preservation with AsyncStorage storage engine |
| **Navigation** | React Navigation | `^6.x` | Native Stack + Animated Bottom Tab Bar with insets |
| **Real-Time** | Socket.io Client | `^4.8.3` | Dual-transport (WebSocket) with exponential backoff reconnect |
| **Networking** | Axios | `^1.6.2` | Intercepted client with automatic failover and token renewal |
| **Security** | Expo Secure Store | `~15.0.8` | Keychain (iOS) & Keystore (Android) AES-encrypted vault |
| **Geospatial** | Expo Location | `~19.0.8` | Real-time GPS coordinates polling with accuracy balancing |
| **Image Pipeline** | Expo Image Manipulator | `~14.0.8` | Image downsampling, cropping, and compression (<2MB payload) |
| **Media Selection**| Expo Image Picker | `^17.0.10` | Camera and photo gallery access for KYC and job proofs |
| **Push Alerts** | Firebase Messaging | `~21.x` | Background and quit-state push notifications with action routing |
| **Error Monitoring**| Sentry React Native| `^8.18.0` | Production crash diagnostics, touch breadcrumbs, traces |
| **UI Polish** | React Native Toast | `^2.3.3` | Non-blocking toasts for status and server alerts |

---

## 📁 Project Directory Structure

```
partner/Local-Pco-Pr/
├── App.tsx                     # Application root, Sentry wrapper, Auth/Main router
├── app.json                    # Expo configuration, bundle IDs, plugins (Sentry, Android SDK)
├── eas.json                    # EAS Build profiles (preview APK, production APK/AAB)
├── babel.config.js             # Babel compiler presets and module plugins
├── tsconfig.json               # TypeScript configuration with strict paths
├── package.json                # Project dependencies and script declarations
├── assets/                     # App icons, splash screens, and adaptive launcher graphics
└── src/
    ├── components/             # Reusable UI component library
    │   ├── DocumentCropModal.tsx   # Touch-enabled cropping & rotation for KYC documents
    │   ├── EarningsCard.tsx        # High-impact earnings visualization widget
    │   ├── IncomingRequestModal.tsx# Floating job dispatch alert with 30s countdown
    │   ├── JobCard.tsx             # Job preview item with status badge and pricing
    │   ├── PrimaryButton.tsx       # Standardized CTA button with loading spinner
    │   └── StatusBadge.tsx         # Color-coded pill badge for job & partner statuses
    │
    ├── config/                 # Environment and endpoint configurations
    │   └── index.ts            # Auto-detects local host IP, production & fallback URLs
    │
    ├── navigation/             # Routing and navigation manifests
    │   ├── BottomTabNavigator.tsx  # Bottom bar (Home, Bookings, Profile) + Profile Stack
    │   └── PartnerStackNavigator.tsx# Stack: Dashboard, Request, Detail, Execution, Appointments
    │
    ├── screens/                # All 17 production application screens
    │   ├── BankAccountScreen.tsx   # Bank account management with OTP verification
    │   ├── BookingsScreen.tsx      # Comprehensive booking history with category tabs
    │   ├── DashboardScreen.tsx     # Partner mission control, online switch & metrics
    │   ├── EditProfileScreen.tsx   # Profile details editor with avatar upload
    │   ├── ForgotPasswordScreen.tsx# Email OTP-driven password reset flow
    │   ├── HelpSupportScreen.tsx   # Customer support call, email, WhatsApp, and FAQs
    │   ├── JobDetailScreen.tsx     # Complete booking specs, dial customer, navigation
    │   ├── JobExecutionScreen.tsx  # 4-stage job progression with photo proof upload
    │   ├── JobRequestScreen.tsx    # Modal/screen incoming job alert with accept/reject
    │   ├── KycScreen.tsx           # Multi-document KYC verification with live status
    │   ├── MyStatsScreen.tsx       # Partner metrics: rating, completion %, job count
    │   ├── ProfileScreen.tsx       # Partner profile hub, stats preview, account menu
    │   ├── RegisterScreen.tsx      # Onboarding registration with category picker
    │   ├── SettingsScreen.tsx      # App preferences, language, cache, and logout
    │   ├── TermsConditionsScreen.tsx# Platform partner legal terms & commission policy
    │   ├── UpcomingAppointmentsScreen.tsx # Scheduled bookings calendar/list view
    │   └── WalletScreen.tsx        # Financial balance, transactions ledger, payouts
    │
    ├── services/               # Core business and API service layers
    │   ├── api.ts                  # Axios client, auth token interceptors, fallback logic
    │   ├── authService.ts          # Login, OTP verification, register, password reset
    │   ├── categoryService.ts      # Fetch active service categories and subcategories
    │   ├── fcmService.ts           # Firebase Cloud Messaging push token and listeners
    │   ├── imageUploadService.ts   # Image validation, base64 conversion (<2MB enforce)
    │   ├── jobService.ts           # Job lifecycle mutations, history, today's summary
    │   ├── secureStorage.ts        # Hardware-encrypted storage using expo-secure-store
    │   ├── socketService.ts        # WebSocket connection manager, rooms, reconnection
    │   └── walletService.ts        # Earnings metrics, transaction records, bank linking
    │
    ├── store/                  # Redux Toolkit state architecture
    │   ├── index.ts                # Store configuration, redux-persist, typed hooks
    │   ├── authSlice.ts            # Auth tokens, user profile, login/logout thunks
    │   ├── partnerSlice.ts         # Availability status, KYC status, profile data
    │   ├── jobSlice.ts             # Active jobs, incoming requests, status transitions
    │   ├── walletSlice.ts          # Wallet balance, earnings period, payout requests
    │   └── __tests__/              # Unit tests for slices and validation logic
    │       ├── kycValidation.test.ts
    │       └── walletSlice.test.ts
    │
    └── utils/                  # Shared helper functions and constants
        ├── constants.ts        # Route names, status codes, colors, typography, spacing
        └── helpers.ts          # Currency formatters, date formatters, distance calculators
```

---

## 🗺️ Navigation Hierarchy & Screens Catalog

The application uses a 3-tier navigation hierarchy managed by `@react-navigation/native-stack` and `@react-navigation/bottom-tabs`:

```
RootNavigator
│
├── [Not Authenticated] ➔ AuthNavigator (Native Stack)
│   ├── LoginScreen              (Phone/Password or Phone/OTP)
│   ├── RegisterScreen           (Partner Onboarding & Category Selection)
│   └── ForgotPasswordScreen     (Email Verification & Password Reset)
│
└── [Authenticated] ➔ BottomTabNavigator (3 Tabs)
    │
    ├── [Tab 1: Home] ➔ PartnerStackNavigator (Native Stack)
    │   ├── DashboardScreen             (Mission Control & Online/Offline Switch)
    │   ├── JobRequestScreen (Modal)    (Incoming Request & 30s Countdown Timer)
    │   ├── JobDetailScreen             (Customer Specs, Address, One-Tap Call)
    │   ├── JobExecutionScreen          (Status Steps: Accepted ➔ Reached ➔ In Progress ➔ Completed)
    │   └── UpcomingAppointmentsScreen  (Scheduled Bookings List)
    │
    ├── [Tab 2: Bookings] ➔ BookingsScreen
    │   └── Filterable Job History (Active, Completed, Cancelled)
    │
    └── [Tab 3: Profile] ➔ ProfileNavigator (Native Stack)
        ├── ProfileScreen               (Account Overview, KYC Banner, Menu)
        ├── KycScreen                   (Document Uploads: Aadhaar, PAN, License, Passbook)
        ├── BankAccountScreen           (Bank Account Binding & OTP Verification)
        ├── MyStatsScreen               (Ratings, Completion %, Earnings Performance)
        ├── HelpSupportScreen           (Helpline, WhatsApp, Email, FAQs)
        ├── TermsConditionsScreen       (Legal Policies & Partner Guidelines)
        └── EditProfileScreen           (Name, Email, City, Avatar Upload)
```

### Complete Screen Inventory (All 17 Screens)

| # | Screen File | Route Name | Access Level | Description & Key Features |
| :-: | :--- | :--- | :--- | :--- |
| **1** | `LoginScreen` (in `App.tsx`) | `Login` | Public | Dual-mode login (Phone + Password OR Phone + 6-digit OTP). Auto-token storage. |
| **2** | `RegisterScreen.tsx` | `Register` | Public | Multi-step partner onboarding. Dynamic category selection, phone verification. |
| **3** | `ForgotPasswordScreen.tsx` | `ForgotPassword` | Public | Self-service password recovery with registered email and OTP verification. |
| **4** | `DashboardScreen.tsx` | `Dashboard` | Authenticated | Mission control: Online/Offline switch, KYC alert, today's earnings, live GPS tracking. |
| **5** | `JobRequestScreen.tsx` | `JobRequest` | Authenticated | Incoming job alert modal. Animated 30-sec circular countdown timer, accept/reject CTA. |
| **6** | `JobDetailScreen.tsx` | `JobDetail` | Authenticated | Full job specification, customer address with Google Maps directions, phone dialer. |
| **7** | `JobExecutionScreen.tsx` | `JobExecution` | Authenticated | Real-time 4-step execution tracker with photo proof upload and completion notes. |
| **8** | `BookingsScreen.tsx` | `BookingsTab` | Authenticated | Job history list with filter tabs (All, Active, Completed, Cancelled) and pull-to-refresh. |
| **9** | `UpcomingAppointmentsScreen.tsx`| `UpcomingAppointments`| Authenticated | Scheduled appointments agenda sorted by date/time with instant job detail access. |
| **10**| `WalletScreen.tsx` | `Wallet` | Authenticated | Financial overview: total earnings, filter by period (Today/Week/Month), payout modal. |
| **11**| `BankAccountScreen.tsx` | `BankAccount` | Authenticated | Add and verify bank accounts (Account No, IFSC code) using backend OTP challenge. |
| **12**| `KycScreen.tsx` | `Kyc` | Authenticated | Multi-document upload (Aadhaar, PAN, License, Passbook) with `DocumentCropModal`. |
| **13**| `ProfileScreen.tsx` | `Profile` | Authenticated | Profile summary: verified rating, total jobs count, service category, account links. |
| **14**| `MyStatsScreen.tsx` | `MyStats` | Authenticated | Performance metrics: rating breakdown, completion rate %, cancelled jobs ratio. |
| **15**| `EditProfileScreen.tsx` | `EditProfile` | Authenticated | Update personal information, phone number, address, and profile picture. |
| **16**| `HelpSupportScreen.tsx` | `HelpSupport` | Authenticated | Contact platform via direct phone call, WhatsApp chat, email, or interactive FAQs. |
| **17**| `TermsConditionsScreen.tsx` | `TermsConditions` | Authenticated | Partner code of conduct, payout schedules, platform commissions, cancellation terms. |

---

## ⚡ Core Business Workflows

### 1. Authentication & Onboarding

Partners can authenticate through two flexible methods:
- **Password Mode**: 10-digit mobile number + password.
- **OTP Mode**: 10-digit mobile number + 6-digit SMS OTP requested via `/auth/partner/request-otp`.
- **JWT Storage**: Tokens are securely stored in hardware-encrypted storage using `expo-secure-store` with automatic injection into subsequent API requests.

### 2. Availability & Real-Time Presence

```
Partner Toggles "Go Online"
  │
  ├── 1. Partner Status Set to ONLINE via Redux & PUT /partner/status
  ├── 2. WebSocket Connected with JWT Handshake (Socket.io)
  ├── 3. Joins dedicated partner room: "partner_<id>"
  └── 4. Starts Expo Location background/foreground watcher:
          - Accuracy: Balanced
          - Polling: Every 10 seconds or 10 meters displacement
          - Emits socket event: 'update_location' { latitude, longitude }
```

When toggled **Offline**:
- Socket disconnects cleanly.
- Location subscription cancels immediately, saving battery.
- Status updates to `offline` on the backend.

### 3. Job Dispatch & 30-Second Acceptance

When a client books a service matching the partner's category and location:
1. **Server Broadcast**: Socket emits `new_job_assigned` to the partner room; FCM push alert delivered if the app is minimized.
2. **Alert UI**: `IncomingRequestModal` or `JobRequestScreen` presents with:
   - Client name, service category, estimated price, distance.
   - Animated visual progress bar counting down from **30 seconds**.
3. **Accept**: Calls `POST /jobs/:id/accept`. Stops timer, transitions screen to `JobDetailScreen`.
4. **Reject / Timeout**: If time expires or partner declines, calls dedicated endpoint `POST /jobs/:id/reject` with decline reason, preserving client booking for reassignment.

### 4. Four-Stage Job Execution Lifecycle

Job progression follows an audited state machine:

```
[ACCEPTED]
   │
   ▼ Partner travels to client location (One-tap directions via Google Maps)
[REACHED]
   │
   ▼ Partner confirms arrival at client premises
[IN_PROGRESS]
   │
   ▼ Partner conducts service (air conditioner servicing, plumbing, pest control, etc.)
[COMPLETED]
   │  - Upload 1-3 completion photos (compressed to <2MB via ImageManipulator)
   │  - Add completion notes & optional customer sign-off
   ▼
[PAYMENT & SETTLEMENT] (Earnings automatically credited to Partner Wallet)
```

### 5. KYC Verification & In-App Cropping

To accept bookings, partners must submit KYC verification.

- **Document Categories**:
  - `aadhaar`: Aadhaar Card (requires both Front & Back images + 12-digit number).
  - `pan`: PAN Card (Front image + 10-character alphanumeric PAN).
  - `license`: Driving License (Front & Back, optional).
  - `passbook`: Bank Passbook or Cancelled Cheque.
  - `photo`: Passport-size profile photograph.
- **`DocumentCropModal`**: Built-in crop and rotation tool ensures documents are framed cleanly without black borders.
- **OOM Protection**: Images are downscaled to max 1024px on longest edge and compressed to 60% JPEG before base64 encoding, preventing Android Out-Of-Memory exceptions.
- **Status Lifecycle**: `NOT_SUBMITTED` ➔ `PENDING` / `UNDER_REVIEW` ➔ `APPROVED` or `REJECTED`.

### 6. Wallet, Bank Accounts & Payouts

- **Period Filters**: Review earnings by `Today`, `This Week`, or `This Month`.
- **Bank Account Linking**: Partners enter Account Number, IFSC, Bank Name, and verify ownership via an SMS OTP challenge before account activation.
- **Payout Processing**: Partner specifies withdrawal amount; upon approval, funds are disbursed to the verified primary account.

### 7. Resilient Dual-Backend Failover

To guarantee 99.9% uptime for field partners, both HTTP (`api.ts`) and WebSocket (`socketService.ts`) layers include transparent automated failover:

```
Primary Server:    https://local-pco.onrender.com/api/v1
Fallback Server:   https://local-pco-5g5i.onrender.com/api/v1
```

If the primary server produces network errors or HTTP `5xx` responses, the Axios interceptor retries the failed request on the backup server and switches all subsequent traffic automatically without disrupting the partner's session.

---

## 🗄️ State Management Architecture

The store is built with **Redux Toolkit (`@reduxjs/toolkit`)** and persisted via **`redux-persist`** with `AsyncStorage`:

```typescript
// Slices Overview
store = {
  auth: {
    isAuthenticated: boolean,
    user: PartnerInfo | null,
    token: string | null,
    isLoading: boolean,
    error: string | null,
  },
  partner: {
    profile: PartnerProfile | null,
    availability: 'online' | 'offline' | 'busy',
    kycStatus: 'pending' | 'under_review' | 'approved' | 'rejected',
    isLoading: boolean,
  },
  job: {
    currentJob: Job | null,
    pendingRequests: Job[],
    todaySummary: { totalJobs, completedJobs, pendingJobs, totalEarnings },
    activeBookings: Job[],
    isUpdating: boolean,
  },
  wallet: {
    summary: WalletSummary | null,
    transactions: Transaction[],
    selectedPeriod: 'today' | 'weekly' | 'monthly',
    isLoading: boolean,
  }
}
```

- **Persistence Whitelist**: `['auth', 'partner']` are saved across device reboots so partners remain logged in with their cached status.
- **Typed Selectors**: Pre-typed `useAppDispatch` and `useAppSelector` prevent typing errors.

---

## 📡 Real-Time WebSocket & Push Notification Protocols

### Socket.io Event Reference

| Event Name | Direction | Payload | Description |
| :--- | :---: | :--- | :--- |
| `connection` | Client ➔ Server | Handshake: `{ auth: { token } }` | Authenticates socket connection with JWT. |
| `new_job_assigned` | Server ➔ Client | `{ id, serviceType, pickupAddress, distance, price }` | Triggers 30s incoming job modal on partner device. |
| `job_cancelled_by_client`| Server ➔ Client | `{ jobId, serviceName, reason }` | Dismisses request modal and notifies partner of cancellation. |
| `update_location` | Client ➔ Server | `{ latitude: number, longitude: number }` | Emits current partner coordinates every 10s when online. |
| `booking_status_change`| Server ➔ Client | `{ bookingId, newStatus }` | Syncs booking status changes made by admin or client. |

### Firebase Push Notifications (FCM)

Configured via `fcmService.ts`:
- **Token Registration**: Device push tokens are registered on authentication via `PUT /notifications/partner/register-token`.
- **Background & Quit State Handler**: `messaging().onNotificationOpenedApp` and `messaging().getInitialNotification()` extract routing data and deep-link directly to `JobRequest` or `JobDetail`.

---

## ⚙️ Configuration & Environment Variables

### Environment Variables (`.env`)

Create a `.env` file in the project root:

```env
# API Base URL (leave blank in dev to auto-detect local machine IP)
API_BASE_URL=https://local-pco.onrender.com/api/v1

# Sentry Crash Reporting DSN
EXPO_PUBLIC_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0

# Cloudinary CDN Credentials (for KYC & proof uploads)
CLOUDINARY_CLOUD_NAME=dblwchjfg
CLOUDINARY_API_KEY=859883225627113
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Environment Identifier
APP_ENV=development
```

### Expo Dynamic IP Auto-Detection (`src/config/index.ts`)

During local testing with Expo, the app automatically extracts the developer machine's host IP from `Constants.expoConfig.hostUri` and binds API requests to `http://<HOST_IP>:5000/api/v1`, eliminating manual IP configuration across Wi-Fi networks.

---

## 🚀 Developer Quickstart & Local Setup

### Prerequisites

- **Node.js**: `v18.x` or `v20.x` (LTS recommended)
- **Package Manager**: `npm` (included with Node.js)
- **Expo CLI**: `npm install -g expo-cli eas-cli`
- **Mobile Device**: Physical Android/iOS device running **Expo Go** or an Android Studio Emulator.

### Step-by-Step Installation

1. **Navigate to the Partner App Directory**:
   ```bash
   cd "d:/Groww You/Local PCO Home Services/local-pco/partner/Local-Pco-Pr"
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Expo Metro Bundler**:
   ```bash
   npx expo start
   ```

4. **Launch on Target Platform**:
   - Press <kbd>a</kbd> to launch on a connected Android device or emulator.
   - Press <kbd>w</kbd> to launch web preview.
   - Scan the QR code with **Expo Go** on Android.
   - For network testing over cellular/different Wi-Fi networks, run:
     ```bash
     npm run tunnel
     ```

---

## 📦 Build & Release Pipelines (EAS)

The app is configured for cloud builds using **Expo Application Services (EAS)**:

### 1. Build Preview APK (Internal Testing)
Produces a standalone Android `.apk` file that can be side-loaded directly onto test devices:
```bash
npx eas build -p android --profile preview
```

### 2. Build Production APK
Produces an optimized production `.apk` targeting the production Render API:
```bash
npx eas build -p android --profile production
```

### 3. Build Google Play App Bundle (.aab)
Produces an optimized `.aab` package for Google Play Console submission:
```bash
npx eas build -p android --profile production-aab
```

---

## 🧪 Testing & Quality Assurance

Unit and integration tests are powered by **Jest** and **ts-jest**:

```bash
# Run all unit tests
npm test

# Run tests in watch mode during development
npx jest --watch

# Run tests with code coverage report
npx jest --coverage
```

### Test Coverage Highlights
- `src/store/__tests__/walletSlice.test.ts`: Verifies transaction sorting, period earnings computation, and payout state reducers.
- `src/store/__tests__/kycValidation.test.ts`: Validates Aadhaar (12 digits), PAN format (ABCDE1234F), file size limits, and base64 parsing.

---

## ❓ Troubleshooting & FAQs

#### Q1: Android crashes or freezes when uploading KYC documents or job completion photos.
> **Solution**: High-resolution camera photos (>10MB) can trigger Out-Of-Memory (OOM) errors in React Native. The app utilizes `expo-image-manipulator` in `KycScreen.tsx` and `JobExecutionScreen.tsx` to automatically downscale images to 1024px maximum edge and 60% JPEG quality prior to base64 encoding. Ensure you don't bypass `compressImage()`.

#### Q2: The app cannot connect to the backend server during local development.
> **Solution**: 
> 1. Ensure your phone and development PC are on the same Wi-Fi network.
> 2. Check Windows Firewall and ensure port `5000` is open for incoming connections.
> 3. Alternatively, launch Metro with tunneling: `npm run tunnel`.

#### Q3: Socket disconnects when the screen locks or app moves to background.
> **Solution**: Mobile operating systems aggressively throttle WebSocket connections when apps are minimized. The app includes an automatic 10-attempt reconnection loop with exponential backoff in `socketService.ts`. When the app is opened, presence is immediately re-established. Background job dispatches are delivered via Firebase Cloud Messaging (FCM).

#### Q4: How does the app switch to the backup server if Render goes to sleep?
> **Solution**: The Axios interceptor in `src/services/api.ts` checks for network errors or 5xx HTTP codes from `https://local-pco.onrender.com`. On failure, it transparently replays the request against `https://local-pco-5g5i.onrender.com/api/v1` and sets `usingFallback = true` for all subsequent calls.

---

## 📄 Platform License

Proprietary — © **Local PCO**. All rights reserved.  
Unauthorized distribution, modification, or commercial reproduction is strictly prohibited.
