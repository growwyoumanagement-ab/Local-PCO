const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
    role: {
        type: String,
        enum: ['user', 'admin', 'verifier'],
        default: 'user'
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    savedAddresses: [{
        label: String,
        type: {
            type: String,
            enum: ['home', 'work', 'other'],
            default: 'home'
        },
        full: String,
        landmark: String,
        city: String,
        pincode: String,
        lat: Number,
        lng: Number,
        isDefault: {
            type: Boolean,
            default: false
        }
    }],
    password: {
        type: String,
        minlength: 6,
        select: false
    },
    // Verifier-specific fields
    firstName: { type: String },
    lastName: { type: String },
    aadhaarCard: { type: String },
    panCard: { type: String },
    aadhaarFrontImage: { type: String },
    aadhaarBackImage: { type: String },
    panCardImage: { type: String },
    houseNumber: { type: String },
    houseAddress: { type: String },
    workplaceAddress: { type: String },
    phone2: { type: String },
    housePhone: { type: String },
    photo: { type: String }, // Cloudinary URL
    avatar: { type: String }, // Cloudinary URL avatar

    otp: {
        type: String,
        select: false
    },
    otpExpires: {
        type: Date,
        select: false
    },
    refreshToken: {
        type: String,
        select: false
    },
    fcmToken: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Clean up optional fields before Mongoose schema validators run
userSchema.pre('validate', function () {
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
userSchema.pre('save', async function () {
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
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
