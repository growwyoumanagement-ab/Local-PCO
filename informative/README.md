# Local PCO — Informative Landing Website

The public-facing marketing and onboarding website for **Local PCO**, connecting homeowners with verified local home service specialists.

---

## Features
- **Hero & Trust Strip**: Modern editorial layout highlighting core brand pillars and stats.
- **Neighborhood Journey**: Interactive 5-step operational workflow walk-through.
- **Client & Partner Ecosystem**: Split dual-journey view showing value propositions for clients and technicians.
- **Interactive Modals**: Instant client booking request modal and service partner registration modal.
- **Direct App Downloads**: One-tap direct downloads for standalone Android client and partner APKs.
- **Admin Gateway**: Safe redirects to the Operations Command Center (`/admin`, `/login`).

---

## Local Development

```bash
# Install dependencies
npm install

# Start local development server (runs on port 5174)
npm run dev

# Run ESLint
npm run lint

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## Deployment on Vercel

The application is pre-configured with `vercel.json` for SPA rewrites, security headers, optimized CDN caching, and direct APK download handlers.

For detailed deployment instructions via the Vercel Dashboard or CLI, please see:
👉 **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**

