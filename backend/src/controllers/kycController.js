const KYCDocument = require('../models/KYCDocument');
const Partner = require('../models/Partner');
const { uploadBase64Image, deleteImage } = require('../utils/uploadService');

/**
 * @desc    Upload KYC document
 * @route   POST /api/v1/kyc/upload
 * @access  Private (Partner)
 */
const uploadKYCDocument = async (req, res) => {
    try {
        const { documentType, documentNumber, imageBase64, side, location } = req.body;
        const partnerId = req.partner._id;

        // Validate required fields
        if (!documentType || !imageBase64) {
            return res.status(400).json({
                success: false,
                message: 'Document type and image are required'
            });
        }

        // Validate document type
        const validTypes = ['aadhaar', 'pan', 'license', 'photo', 'passbook'];
        if (!validTypes.includes(documentType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid document type'
            });
        }

        // Determine side (default to 'front')
        const docSide = side || 'front';

        // Validate document number for required types (only required on front side)
        if (docSide === 'front' && ['aadhaar', 'pan', 'license'].includes(documentType) && !documentNumber) {
            return res.status(400).json({
                success: false,
                message: `Document number is required for ${documentType}`
            });
        }

        // Check if document already exists for this type and side (handle legacy docs with missing side -> treat as front)
        const existingDoc = await KYCDocument.findOne({
            partner: partnerId,
            documentType: documentType,
            $or: [
                { side: docSide },
                ...(docSide === 'front' ? [{ side: { $exists: false } }, { side: null }, { side: '' }] : [])
            ]
        });

        // If exists and approved, don't allow re-upload
        if (existingDoc && existingDoc.status === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'This document is already approved and cannot be replaced'
            });
        }

        // Delete old image from Cloudinary if exists
        if (existingDoc && existingDoc.cloudinaryPublicId) {
            try {
                await deleteImage(existingDoc.cloudinaryPublicId);
            } catch (error) {
                console.error('Failed to delete old image:', error);
            }
        }

        // Upload image to Cloudinary
        const folder = `kyc/${documentType}`;
        const uploadResult = await uploadBase64Image(imageBase64, folder);

        if (!uploadResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to upload image to cloud storage'
            });
        }

        // Create or update KYC document
        const documentData = {
            partner: partnerId,
            documentType,
            side: docSide,
            documentNumber: documentNumber || undefined,
            imageUrl: uploadResult.url,
            cloudinaryPublicId: uploadResult.publicId,
            status: 'under_review'
        };

        let kycDocument;
        if (existingDoc) {
            // Update existing document
            kycDocument = await KYCDocument.findByIdAndUpdate(
                existingDoc._id,
                documentData,
                { new: true, runValidators: true }
            );
        } else {
            // Create new document
            kycDocument = await KYCDocument.create(documentData);
        }

        // Update partner's KYC status and location
        const partner = await Partner.findById(partnerId);
        if (partner.kycStatus === 'pending') {
            partner.kycStatus = 'under_review';
        }
        // Save KYC location if provided
        if (location && location.latitude && location.longitude) {
            partner.kycLocation = {
                latitude: location.latitude,
                longitude: location.longitude,
                address: location.address || null,
                capturedAt: new Date()
            };
        }
        await partner.save();

        res.status(201).json({
            success: true,
            message: 'Document uploaded successfully',
            data: {
                id: kycDocument._id,
                type: kycDocument.documentType,
                side: kycDocument.side,
                status: kycDocument.status,
                imageUrl: kycDocument.imageUrl,
                uploadedAt: kycDocument.createdAt
            }
        });
    } catch (error) {
        console.error('Upload KYC document error:', error);
        console.error('Error stack:', error.stack);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            code: error.code
        });

        // Detect Cloudinary credential errors and return a clear message
        // instead of exposing raw "Invalid api_key" to the mobile client.
        const isCloudinaryAuthError =
            error.message &&
            (error.message.toLowerCase().includes('invalid api_key') ||
                error.message.toLowerCase().includes('invalid api key') ||
                error.message.toLowerCase().includes('api_secret') ||
                error.message.toLowerCase().includes('cloud_name') ||
                error.http_code === 401);

        res.status(500).json({
            success: false,
            message: isCloudinaryAuthError
                ? 'Document upload service is temporarily unavailable. Please try again later or contact support.'
                : error.message || 'Failed to upload document',
        });
    }
};

/**
 * @desc    Get KYC status and all documents
 * @route   GET /api/v1/kyc/status
 * @access  Private (Partner)
 */
const getKYCStatus = async (req, res) => {
    try {
        const partnerId = req.partner._id;

        // Get partner's KYC status
        const partner = await Partner.findById(partnerId).select('kycStatus');

        // Get all KYC documents for this partner
        const documents = await KYCDocument.find({ partner: partnerId })
            .select('documentType side documentNumber imageUrl status rejectionReason createdAt updatedAt')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: {
                kycStatus: partner.kycStatus,
                documents: documents.map(doc => ({
                    id: doc._id,
                    type: doc.documentType,
                    side: doc.side,
                    documentNumber: doc.documentNumber,
                    imageUrl: doc.imageUrl,
                    status: doc.status,
                    rejectionReason: doc.rejectionReason,
                    uploadedAt: doc.createdAt,
                    verifiedAt: doc.updatedAt
                }))
            }
        });
    } catch (error) {
        console.error('Get KYC status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch KYC status'
        });
    }
};

/**
 * @desc    Get all KYC documents
 * @route   GET /api/v1/kyc/documents
 * @access  Private (Partner)
 */
const getKYCDocuments = async (req, res) => {
    try {
        const partnerId = req.partner._id;

        const documents = await KYCDocument.find({ partner: partnerId })
            .select('documentType side documentNumber imageUrl status rejectionReason createdAt')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: documents
        });
    } catch (error) {
        console.error('Get KYC documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch documents'
        });
    }
};

/**
 * @desc    Delete KYC document
 * @route   DELETE /api/v1/kyc/document/:id
 * @access  Private (Partner)
 */
const deleteKYCDocument = async (req, res) => {
    try {
        const partnerId = req.partner._id;
        const documentId = req.params.id;

        const document = await KYCDocument.findOne({
            _id: documentId,
            partner: partnerId
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Don't allow deletion of approved documents
        if (document.status === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete approved documents'
            });
        }

        // Delete from Cloudinary
        if (document.cloudinaryPublicId) {
            try {
                await deleteImage(document.cloudinaryPublicId);
            } catch (error) {
                console.error('Failed to delete image from Cloudinary:', error);
            }
        }

        // Delete from database
        await KYCDocument.findByIdAndDelete(documentId);

        res.json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        console.error('Delete KYC document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete document'
        });
    }
};

module.exports = {
    uploadKYCDocument,
    getKYCStatus,
    getKYCDocuments,
    deleteKYCDocument
};
