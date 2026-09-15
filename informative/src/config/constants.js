/**
 * Configuration constants for the informative landing website.
 */

// URL for the Operations Command Center / Admin Portal.
// In development, defaults to Vite's admin dev server on port 5173.
// In production, can be configured via VITE_ADMIN_URL or defaults to the deployed admin portal.
export const ADMIN_PORTAL_URL = 
  import.meta.env.VITE_ADMIN_URL || 
  (import.meta.env.DEV ? 'http://localhost:5173' : 'https://local-pco.vercel.app');
