import * as Sentry from '@sentry/react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from "@/components/theme-provider"

// Initialize Sentry for admin dashboard.
// Inactive unless VITE_SENTRY_DSN is set in .env.
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    // 10% of prod transactions, 100% in dev to catch issues early
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<p style={{ padding: 32 }}>An unexpected error occurred. The team has been notified.</p>}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <App />
      </ThemeProvider>
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
