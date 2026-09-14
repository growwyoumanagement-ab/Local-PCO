const express = require('express');
const router = express.Router();
const { protectPartner } = require('../middleware/authMiddleware');
const {
    uploadKYCDocument,
    getKYCStatus,
    getKYCDocuments,
    deleteKYCDocument
} = require('../controllers/kycController');

// @desc    Upload KYC document
// @route   POST /api/v1/kyc/upload
// @access  Private (Partner)
router.post('/upload', protectPartner, uploadKYCDocument);

// @desc    Get KYC status and all documents
// @route   GET /api/v1/kyc/status
// @access  Private (Partner)
router.get('/status', protectPartner, getKYCStatus);

// @desc    Get all KYC documents
// @route   GET /api/v1/kyc/documents
// @access  Private (Partner)
router.get('/documents', protectPartner, getKYCDocuments);

// @desc    Delete KYC document
// @route   DELETE /api/v1/kyc/document/:id
// @access  Private (Partner)
router.delete('/document/:id', protectPartner, deleteKYCDocument);

module.exports = router;
