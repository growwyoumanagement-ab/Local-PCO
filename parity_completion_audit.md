# Local PCO Home Services — Bug, Parity & Completion Audit

This audit evaluates the current state of the Local PCO Home Services monorepo to determine what is genuinely completed, partially implemented, or entirely missing across the stack.

> [!CAUTION]
> Several critical paths are currently disconnected or rely on mock data. Specifically, the Wallet/Payments system and Client-to-Partner job booking flow contain significant launch-blocking gaps.

---

## 1. Backend ↔ Frontend Parity Table

The following table maps the entire backend API surface area and its consumption by the Admin, Partner, and Client applications.

| Route | Method | Admin? | Partner? | Client? | Notes / Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** (`/api/v1/auth`) | | | | | |
| `/client/login`, `/register`, `/request-otp`, `/verify-otp` | POST | ❌ | ❌ | ✅ | Working as intended. |
| `/partner/login`, `/register`, `/request-otp`, `/verify-otp` | POST | ❌ | ✅ | ❌ | Working as intended. |
| `/auth/refresh` | POST | ❌ | **404** | **404** | **Blocker**: Mobile Axios interceptors call this on 401s, but it doesn't exist on the backend, causing login crash loops. |
| `/partner/logout`, `/validate`, `/reset-password` | Mixed | ❌ | **404** | ❌ | **Orphaned UI**: Partner app calls these, but they are not implemented on the backend. |
| **Admin** (`/api/v1/admin`) | | | | | |
| `/stats` | GET | **404** | ❌ | ❌ | **Bug**: `adminService.ts` calls `/v1/admin/...` but `dashboard.service.ts` calls `/admin/stats`. Since Vite base URL is `/api`, this hits `/api/admin/stats` instead of `/api/v1/admin/stats`. |
| `/partners`, `/partners/:id`, `/partners/:id/kyc` | Mixed | ⚠️ | ❌ | ❌ | **Partial**: Same Base URL bug as above. Some calls use `/v1/`, some don't. |
| `/clients`, `/clients/:id/block`, `/clients/:id/bookings` | Mixed | ⚠️ | ❌ | ❌ | **Partial**: Susceptible to the Base URL routing bug. |
| `/bookings`, `/wallets` | GET | ⚠️ | ❌ | ❌ | **Partial**: `adminController.js` hardcodes wallet balances to `0`. |
| `/services`, `/content`, `/kyc-documents`, `/verifiers` | Mixed | ✅ | ❌ | ❌ | Implemented, though `/verifiers` UI is untested against roles. |
| **Category/Service** (`/api/v1/categories` & `/api/v1/services`) | | | | | |
| `/categories` | GET | ✅ | ❌ | ❌ | Returns categories filtering out inactive subcategories. |
| `/services` | GET | ❌ | ❌ | ✅ | Returns identical categories without filtering. **Tech Debt**: Duplicated logic across two routes. |
| **Jobs** (`/api/v1/jobs`) | | | | | |
| `/pending-requests`, `/today-summary`, `/history`, `/:id` | GET | ❌ | ✅ | ❌ | Consumed correctly by Partner app. |
| `/:id/status` | PUT | ❌ | ✅ | ❌ | Consumed, but missing state guards. |
| `/:id/upload-proof` | POST | ❌ | **404** | ❌ | **Blocker**: Partner app `jobService.ts` attempts to upload proof images here, but route doesn't exist. |
| **Wallet** (`/api/v1/wallet`) | | | | | |
| `/partner`, `/partner/transactions`, `/partner/payout` | Mixed | ❌ | ✅ | ❌ | Partially implemented, but balances are broken. |
| `/partner/earnings`, `/partner/payouts`, `/partner/bank-accounts` | Mixed | ❌ | **404** | ❌ | **Blocker**: Partner app `walletService.ts` makes 6 different wallet/bank API calls that simply do not exist on the backend. |
| **Requests** (`/api/v1/requests`) | | | | | |
| `/`, `/active`, `/history`, `/:id` | Mixed | ❌ | ❌ | ✅ | Consumed correctly by Client app. |
| `/services` | GET | ❌ | ❌ | ✅ | **Blocker**: Client calls this, but `requestController.js` returns a hardcoded mock array of services (`basePrice: 500`, etc). |
| `/:id/cancel` | PUT | ❌ | ❌ | **404** | **Missing**: Client app tries to cancel requests here, but backend route does not exist. |
| **Location / KYC / Partner** | | | | | |
| All Location / KYC / Partner profile routes | Mixed | ❌ | ✅ | ✅ | Mostly mapped 1:1 correctly. |

---

## 2. Blocker List (End-to-End Core Flows)

The following missing or broken pieces prevent a functional beta launch:

1. **Wallet & Payments are Stubbed**:
   - Job completion (`jobController.js:113`) updates `finalCharges` but does not write the required `Transaction` ledger document (although `paymentController.razorpayWebhook` creates completed credit transactions for `payment.captured`).
   - Admin wallets (`adminController.js:291`) return hardcoded `{ balance: 0 }`.
2. **Admin Base URL Mismatches**:
   - Half of the Admin dashboard's API services (`wallet.service.ts`, `partner.service.ts`) omit the `/v1` prefix. When appended to the `axios.baseURL` (`/api`), requests go to `/api/admin/wallets` and 404, breaking the dashboard screens.
3. **Missing Partner Wallet/Bank Routes**:
   - The Partner app has screens to manage bank details via `/wallet/partner/bank-accounts`, but the backend only mounted `/api/v1/partner/bank-details`. The UI will instantly crash/fail.
4. **Mocked Client Services**:
   - The Client app fetches services from `/api/v1/requests/services`. The backend `requestController.js:8` completely ignores the database and returns a static mock array. New services added via Admin will never show up on the client app.
5. **Missing Job Cancellation/Proof Routes**:
   - Clients cannot cancel jobs (missing `PUT /requests/:id/cancel`).
   - Partners cannot upload proof of completion (missing `POST /jobs/:id/upload-proof`).
6. **No Real-time Sync**:
   - Clients have no Push Notification/WebSocket mechanism to know when a Partner accepts a job. They must manually refresh the active request screen.

---

## 3. Bug & Correctness Issues

* **Illegal State Transitions (`jobController.js:88`)**: `updateJobStatus` only checks if the new status equals the old status. It does not enforce a state machine, meaning a Partner could transition a job from `completed` back to `pending`.
* **Missing Default Address Verification (`requestController.js`)**: If a client has no saved addresses, creating a request will silently create a booking with `[0, 0]` coordinates, completely breaking the Partner's distance/search queries.
* **Redundant Service/Category Routes**: `categoryRoutes.js` and `serviceRoutes.js` fetch identical `ServiceCategory` documents. One filters inactive subcategories, the other does not.
* **KYC Partner Search Loophole**: While `/partner/search` filters for `kycStatus: 'approved'`, the `Partner` schema sets `isActive: true` by default. The `protectPartner` auth middleware only checks `isActive === false`. This leaves edge cases where unverified partners could potentially bypass UI and hit authenticated API endpoints.

---

## 4. Completion Scorecard

Based on verifiable code, here is the completion status of the monorepo:

### Module Status
* **Backend:** 70% (Core schemas exist, but integrations/state-machines are stubbed).
* **Admin Dashboard:** 60% (UI is built, but routing bugs and mocked backend responses break functionality).
* **Partner Mobile App:** 65% (Heavy reliance on missing endpoints like `/wallet/...` and `/auth/logout`).
* **Client Mobile App:** 75% (UI is mostly intact, but lacks push notifications and relies on mock backend data).
* **Informative Site:** 95% (Static landing site, mostly complete).

### End-to-End Flow Status
| Flow | Est. % | Status |
| :--- | :--- | :--- |
| **Client Signup/Login** | 90% | Working, but missing token refresh. |
| **Browse/Request Service** | 60% | Client UI works, but backend returns hardcoded static mocks. |
| **Partner Onboarding/KYC** | 80% | Working, documents upload successfully, admin can approve. |
| **Partner Job Accept/Complete** | 70% | Working, but no proof-upload endpoint and no state guards. |
| **Wallet/Payment** | 10% | **Broken**. Transactions are not generated; all balances are 0. |
| **Admin Management** | 50% | **Broken**. Route prefix bugs cause 404s; wallet data is stubbed. |
| **Content/Categories** | 80% | Working, though with duplicated endpoints. |

---

## 5. Overall Verdict

**The platform is currently in the Early-to-Mid Beta stage and is NOT launch-ready.** 

While the individual UI shells and database schemas are well-architected, the seams connecting the 5 modules are heavily fractured. The most critical launch blocker is the complete absence of a functional Wallet/Transaction ledger—job completions do not generate financial records. Furthermore, hardcoded backend endpoints (like `/requests/services`), missing mobile endpoints (like `/jobs/upload-proof`), and Admin API routing bugs must be resolved before a viable end-to-end booking can take place.
