const express = require('express');
const router = express.Router();
const { protectClient } = require('../middleware/authMiddleware');
const {
    getServices,
    createRequest,
    getActiveRequest,
    getRequestHistory,
    cancelRequest,
    getRequestById,
    submitReview,
    skipReview,
    rescheduleAppointment
} = require('../controllers/requestController');

router.get('/services', getServices);
router.post('/', protectClient, createRequest);
router.get('/active', protectClient, getActiveRequest);
router.get('/history', protectClient, getRequestHistory);
router.put('/:id/cancel', protectClient, cancelRequest);
router.put('/:id/reschedule', protectClient, rescheduleAppointment);
router.post('/:id/review', protectClient, submitReview);
router.put('/:id/skip-review', protectClient, skipReview);
router.get('/:id', protectClient, getRequestById);

module.exports = router;
