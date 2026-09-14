const mongoose = require('mongoose');

const serviceCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a category name'],
        unique: true
    },
    icon: {
        type: String
    },
    description: {
        type: String
    },
    subcategories: [{
        name: {
            type: String,
            required: true
        },
        icon: {
            type: String
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
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.models.ServiceCategory || mongoose.model('ServiceCategory', serviceCategorySchema);
