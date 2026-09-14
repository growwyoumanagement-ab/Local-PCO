const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    partnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Partner',
        required: true
    },
    bookingType: {
        type: String,
        enum: ['instant', 'appointment', 'call_log'],
        required: true
    },
    scheduledAt: Date,
    reminderSent: {
        type: Boolean,
        default: false
    },
    reminderSending: {
        type: Boolean,
        default: false
    },
    clientNotifiedOfCancel: {
        type: Boolean,
        default: false
    },
    clientNotifyingSending: {
        type: Boolean,
        default: false
    },
    cancelledBy: {
        type: String,
        enum: ['client', 'partner', 'partner_reject', 'system']
    },
    serviceType: {
        type: String,
        required: true
    },
    serviceName: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'accepted', 'confirmed', 'en_route', 'reached', 'arrived', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    reachedAt: Date,
    address: {
        full: String,
        landmark: String,
        city: String,
        pincode: String,
        lat: Number,
        lng: Number
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        }
    },
    notes: String,
    estimatedCharges: Number,
    finalCharges: Number,
    proofImages: [String],
    completionNotes: String,
    interestedPartners: [{
        partnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Partner'
        },
        clickedAt: {
            type: Date,
            default: Date.now
        }
    }],
    completedAt: Date,
    isReviewed: {
        type: Boolean,
        default: false
    },
    statusHistory: [{
        status: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        updatedBy: String // 'client' or 'partner' or 'system'
    }]
}, {
    timestamps: true
});

serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ clientId: 1, createdAt: -1 });
serviceRequestSchema.index({ partnerId: 1, createdAt: -1 });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
