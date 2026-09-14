const mongoose = require('mongoose');

const kycAuditLogSchema = new mongoose.Schema({
    partnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Partner',
        required: [true, 'Partner reference is required']
    },
    verifierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Verifier reference is required']
    },
    action: {
        type: String,
        enum: ['approve', 'reject', 'put_on_hold', 'request_more_info', 'submitted', 'site_visit'],
        required: [true, 'Action is required']
    },
    reason: {
        type: String,
        required: function () {
            return ['reject', 'request_more_info'].includes(this.action);
        }
    },
    previousStatus: {
        type: String
    },
    newStatus: {
        type: String
    },
    siteVisitImage: {
        type: String // Cloudinary URL
    },
    siteVisitLocation: {
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String },
        capturedAt: { type: Date }
    },
    timestamp: {
        type: Date,
        default: Date.now,
        immutable: true
    }
}, {
    timestamps: false // We use our own immutable timestamp
});

// Index for fast lookups by partner
kycAuditLogSchema.index({ partnerId: 1, timestamp: -1 });

module.exports = mongoose.model('KYCAuditLog', kycAuditLogSchema);

