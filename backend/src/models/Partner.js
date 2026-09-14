const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const partnerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
        unique: true,
        match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number']
    },
    email: {
        type: String,
        required: false,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    resetPasswordOTP: {
        type: String,
        select: false
    },
    resetPasswordOTPExpires: {
        type: Date,
        select: false
    },
    password: {
        type: String,
        minlength: 6,
        select: false
    },
    otp: {
        type: String,
        select: false
    },
    otpExpires: {
        type: Date,
        select: false
    },
    serviceCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceCategory',
        required: [true, 'Please select a service category']
    },
    serviceCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceCategory'
    }],
    serviceSubcategory: {
        type: String,
        default: null
    },
    kycStatus: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected', 'on_hold', 'need_info'],
        default: 'pending'
    },
    kycRejectionReason: {
        type: String,
        default: null
    },
    kycSubmittedAt: {
        type: Date,
        default: Date.now
    },
    kycLocation: {
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null },
        address: { type: String, default: null },
        capturedAt: { type: Date, default: null }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere',
            default: [0, 0] // Default to 0,0 until updated
        }
    },
    avatar: {
        type: String
    },
    bankAccounts: [{
        accountHolderName: { type: String, required: true },
        accountNumber: { type: String, required: true },
        bankName: { type: String, required: true },
        ifsc: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true }
    }],
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String },
        country: { type: String, default: 'India' }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    averageRating: {
        type: Number,
        default: 0
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    totalJobs: {
        type: Number,
        default: 0
    },
    refreshToken: {
        type: String,
        select: false
    },
    fcmToken: {
        type: String,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field for KYC documents
partnerSchema.virtual('kycDocuments', {
    ref: 'KYCDocument',
    localField: '_id',
    foreignField: 'partner'
});

// Clean up optional fields before Mongoose schema validators run
partnerSchema.pre('validate', function () {
    if (this.email !== undefined && (this.email === null || typeof this.email !== 'string' || this.email.trim() === '')) {
        this.email = undefined;
    } else if (typeof this.email === 'string') {
        this.email = this.email.trim().toLowerCase();
    }
    if (this.phone && typeof this.phone === 'string') {
        this.phone = this.phone.replace(/\D/g, '').slice(-10);
    }
});

// Encrypt password using bcrypt & normalize optional email
partnerSchema.pre('save', async function () {
    if (!this.email || (typeof this.email === 'string' && this.email.trim() === '')) {
        this.email = undefined;
    }
    if (!this.isModified('password') || !this.password) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
partnerSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

partnerSchema.index({ kycStatus: 1, isActive: 1, isOnline: 1 });

module.exports = mongoose.model('Partner', partnerSchema);
