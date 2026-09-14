const express = require('express');
const router = express.Router();
const { protectVerifier } = require('../middleware/verifierMiddleware');
const {
    getVerificationQueue,
    performVerificationAction,
    getPartnerAuditLog,
    getVerifierDashboardStats,
    getVerificationHistory,
    uploadSiteVisit
} = require('../controllers/verifierController');

// All routes require verifier authentication
router.use(protectVerifier);

// Dashboard stats
router.get('/stats', getVerifierDashboardStats);

// Verification queue
router.get('/queue', getVerificationQueue);

// Verification history
router.get('/history', getVerificationHistory);

// Partner-specific actions
router.put('/partners/:id/action', performVerificationAction);
router.post('/partners/:id/site-visit', uploadSiteVisit);
router.get('/partners/:id/audit-log', getPartnerAuditLog);

module.exports = router;
