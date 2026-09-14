const mongoose = require('mongoose');

const contentSectionSchema = new mongoose.Schema({
    sectionType: {
        type: String,
        required: true,
        enum: ['home_services', 'banner', 'trending'],
    },
    title: {
        type: String,
        required: true
    },
    items: [{
        name: {
            type: String,
            required: true
        },
        icon: {
            type: String
        },
        image: {
            type: String  // For banners
        },
        subtitle: {
            type: String  // For banners
        },
        ctaText: {
            type: String  // For banners
        },
        backgroundColor: {
            type: String,  // For banners
            default: '#E3F2FD'
        },
        priority: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    priority: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});


module.exports = mongoose.models.ContentSection || mongoose.model('ContentSection', contentSectionSchema);
