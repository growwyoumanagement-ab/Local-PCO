const mongoose = require('mongoose');

const kycDocumentSchema = new mongoose.Schema({
    partner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Partner',
        required: [true, 'Partner reference is required']
    },
    documentType: {
        type: String,
        required: [true, 'Document type is required'],
        enum: ['aadhaar', 'pan', 'license', 'photo', 'passbook']
    },
    side: {
        type: String,
        enum: ['front', 'back'],
        default: 'front'
    },
    documentNumber: {
        type: String,
        required: function () {
            // Document number is required for the front side of aadhaar, pan, and license
            return (this.side || 'front') === 'front' && ['aadhaar', 'pan', 'license'].includes(this.documentType);
        }
    },
    imageUrl: {
        type: String,
        required: [true, 'Image URL is required']
    },
    cloudinaryPublicId: {
        type: String,
        required: [true, 'Cloudinary public ID is required']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'under_review'],
        default: 'pending'
    },
    rejectionReason: {
        type: String
    },
    verifiedAt: {
        type: Date
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for faster queries — now includes side so front & back are separate docs
kycDocumentSchema.index({ partner: 1, documentType: 1, side: 1 });

module.exports = mongoose.models.KYCDocument || mongoose.model('KYCDocument', kycDocumentSchema);
