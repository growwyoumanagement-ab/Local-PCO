# Vercel Deployment Guide — Local PCO Informative Website

This guide walks you through deploying the **Local PCO Informative Landing Website** to [Vercel](https://vercel.com).

---

## Architecture Summary
- **Framework**: React 19 + Vite 8
- **Build Output**: `dist/`
- **Routing**: Single-Page Application (SPA) handled via `vercel.json` rewrite rules
- **Assets**: Static assets, service graphics, brand logos, and standalone Android APKs (`client-app.apk` ~71MB, `partner-app.apk` ~69MB)

---

## Method 1: Deploy via Vercel Dashboard (Recommended)

1. Log into your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** → **"Project"**.
3. Select your repository: `shivkantdhakre/Local-PCO`.
4. In the **Configure Project** screen, configure the following settings:
   - **Project Name**: `local-pco-informative` (or `local-pco-landing`)
   - **Framework Preset**: `Vite` (automatically detected)
   - **Root Directory**: Click **Edit** and choose `informative` (⚠️ **CRITICAL STEP**)
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `dist` (leave default)
   - **Install Command**: `npm install` (leave default)

5. **Environment Variables**:
   Under **Environment Variables**, configure:
   | Variable | Value | Description |
   |---|---|---|
   | `VITE_ADMIN_URL` | `https://local-pco.vercel.app` | URL of your deployed Admin Operations Command Center |

6. Click **Deploy**.
   Vercel will build and assign your project a production domain (e.g. `local-pco-informative.vercel.app`).

---

## Method 2: Deploy via Vercel CLI

If you prefer deploying from your terminal:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Navigate into the `informative` folder**:
   ```bash
   cd informative
   ```

3. **Deploy a Preview**:
   ```bash
   vercel
   ```
   - *Set up and deploy?* → `y`
   - *Which scope?* → Select your account / team
   - *Link to existing project?* → `N` (or select existing if linked)
   - *What's your project's name?* → `local-pco-informative`
   - *In which directory is your code located?* → `./`

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

---

## Key Configurations Included in this Repository

### 1. `vercel.json`
- **SPA Routing**: Rewrites all non-file requests (`/(.*)`) to `/index.html` so client-side navigation (e.g. `/admin`, `/login`, modal routes) and browser refreshes work without 404 errors.
- **Security Headers**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- **CDN Caching**:
  - `/assets/*` hashed bundles cached for 1 year (`max-age=31536000, immutable`).
  - Brand assets and images cached with stale-while-revalidate headers.
- **Direct APK Downloads**:
  - `client-app.apk` and `partner-app.apk` are served with `Content-Type: application/vnd.android.package-archive` and `Content-Disposition: attachment` to ensure mobile web browsers trigger an immediate, seamless direct download.

### 2. `vite.config.js` Chunk Splitting
- Rollup vendor code (`react`, `react-dom`, `react-router-dom`), motion engines (`framer-motion`), and UI icons (`lucide-react`) are pre-chunked for faster cold-cache loads and edge distribution.

### 3. SEO & Open Graph Meta Tags
- `index.html` includes fully qualified Open Graph and Twitter Card tags pointing to `https://localpco.com` for rich link previews across WhatsApp, Twitter/X, and social messengers.

---

## Custom Domain Configuration

To connect your custom domain (e.g., `localpco.com` or `www.localpco.com`):
1. In the Vercel Dashboard, go to **Project Settings** → **Domains**.
2. Enter your domain (e.g. `localpco.com`).
3. Add the recommended `CNAME` or `A` record in your DNS provider (Cloudflare, GoDaddy, Namecheap, etc.).
4. Vercel will automatically provision a free SSL certificate.
