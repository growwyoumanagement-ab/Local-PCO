const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceRequest',
        required: true,
        unique: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    partnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Partner',
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    feedback: {
        type: String,
        default: ''
    },
    tags: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

// Static method to calculate average rating
reviewSchema.statics.calcAverageRatings = async function (partnerId) {
    const pId = mongoose.Types.ObjectId.isValid(partnerId)
        ? new mongoose.Types.ObjectId(partnerId)
        : partnerId;
    const obj = await this.aggregate([
        { $match: { partnerId: pId } },
        {
            $group: {
                _id: '$partnerId',
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    try {
        if (obj.length > 0) {
            await this.model('Partner').findByIdAndUpdate(pId, {
                averageRating: Math.round(obj[0].averageRating * 10) / 10, // Round to 1 decimal
                totalReviews: obj[0].totalReviews
            });
        } else {
            await this.model('Partner').findByIdAndUpdate(pId, {
                averageRating: 0,
                totalReviews: 0
            });
        }
    } catch (err) {
        console.error('Error recalculating average rating:', err);
    }
};

// NOTE: Rating aggregation on create is handled inside the submitReview transaction
// in requestController.js to guarantee consistency. The post('save') fire-and-forget
// hook has been removed to avoid stale snapshots overwriting transactionally-consistent values.

// Recalculate averages when a review is deleted (e.g. by admin)
reviewSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        try {
            await doc.constructor.calcAverageRatings(doc.partnerId);
        } catch (err) {
            console.error('Error recalculating average rating after delete:', err);
        }
    }
});

module.exports = mongoose.model('Review', reviewSchema);
