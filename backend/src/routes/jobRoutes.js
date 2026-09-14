const express = require('express');
const router = express.Router();
const { protectPartner } = require('../middleware/authMiddleware');
const {
    getPendingJobs,
    getJobById,
    updateJobStatus,
    rejectJob,
    getActiveJobs,
    getJobHistory,
    getTodaysSummary,
    uploadJobProof,
    getAcceptedAppointments
} = require('../controllers/jobController');

router.get('/pending-requests', protectPartner, getPendingJobs);
router.get('/today-summary', protectPartner, getTodaysSummary);
router.get('/appointments', protectPartner, getAcceptedAppointments);
router.get('/history', protectPartner, getJobHistory);
// FIX #9: Active jobs endpoint (accepted/reached/in_progress) — must be before /:id
router.get('/active', protectPartner, getActiveJobs);

// FIX #4: Dedicated reject endpoint
router.post('/:id/reject', protectPartner, rejectJob);

router.get('/:id', protectPartner, getJobById);
router.put('/:id/status', protectPartner, updateJobStatus);
router.post('/:id/upload-proof', protectPartner, uploadJobProof);

module.exports = router;
