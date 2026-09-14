const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    partnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Partner',
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceRequest'
    },
    type: {
        type: String,
        enum: ['credit', 'debit', 'payout', 'bonus'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    bankAccountId: {
        type: mongoose.Schema.Types.ObjectId
    },
    reason: String,
    description: String,
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    },
    paymentId: {
        type: String,
        unique: true,
        sparse: true
    }
}, {
    timestamps: true
});

transactionSchema.index({ partnerId: 1, createdAt: -1 });

transactionSchema.index(
    { partnerId: 1 },
    {
        unique: true,
        partialFilterExpression: { type: 'payout', status: 'pending' }
    }
);

module.exports = mongoose.model('Transaction', transactionSchema);
