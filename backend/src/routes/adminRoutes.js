const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/adminMiddleware');
const {
    getDashboardStats,
    getAllPartners,
    createPartner,
    getPartnerById,
    resetPartnerPassword,
    verifyPartnerKyc,
    togglePartnerStatus,
    getAllClients,
    toggleClientBlock,
    getAllBookings,
    getClientBookings,
    getAllWallets,
    approvePayout,
    rejectPayout,
    getAllServiceCategories,
    createServiceCategory,
    updateServiceCategory,
    deleteServiceCategory,
    updateKycDocumentStatus,
    verifyPartnerBankDetails,
    addPartnerBankAccount,
    getAllContent,
    createContent,
    updateContent,
    deleteContent,
    getVerifiers,
    createVerifier,
    toggleVerifierStatus,
    uploadImage
} = require('../controllers/adminController');

router.use(protectAdmin);

router.get('/stats', getDashboardStats);
router.route('/partners')
    .get(getAllPartners)
    .post(createPartner);
router.get('/partners/:id', getPartnerById);
router.put('/partners/:id/kyc', verifyPartnerKyc);
router.put('/partners/:id/status', togglePartnerStatus);
router.put('/partners/:id/reset-password', resetPartnerPassword);
router.post('/partners/:id/bank-accounts', addPartnerBankAccount);
router.put('/partners/:id/bank-verify', verifyPartnerBankDetails);

router.get('/clients', getAllClients);
router.put('/clients/:id/block', toggleClientBlock);
router.get('/clients/:id/bookings', getClientBookings);

router.get('/bookings', getAllBookings);

router.get('/wallets', getAllWallets);
router.put('/payouts/:transactionId/approve', approvePayout);
router.put('/payouts/:transactionId/reject', rejectPayout);

router.route('/services')
    .get(getAllServiceCategories)
    .post(createServiceCategory);

router.route('/services/:id')
    .put(updateServiceCategory)
    .delete(deleteServiceCategory);

// Content Management Routes
router.route('/content')
    .get(getAllContent)
    .post(createContent);

router.route('/content/:id')
    .put(updateContent)
    .delete(deleteContent);

router.put('/kyc-documents/:id/status', updateKycDocumentStatus);

// Image Upload Route (single image at a time to avoid payload limits)
router.post('/upload-image', uploadImage);

// Verifier Management Routes
router.route('/verifiers')
    .get(getVerifiers)
    .post(createVerifier);
router.put('/verifiers/:id/status', toggleVerifierStatus);

module.exports = router;
