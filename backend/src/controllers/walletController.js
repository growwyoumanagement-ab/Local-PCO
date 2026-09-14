const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const ServiceRequest = require('../models/ServiceRequest');
const Partner = require('../models/Partner');

// @desc    Get wallet summary
// @route   GET /api/v1/wallet/partner
// @access  Private (Partner)
const getWalletSummary = async (req, res) => {
    try {
        const partnerId = req.partner._id;

        const earningsAgg = await Transaction.aggregate([
            { $match: { partnerId: partnerId, type: 'credit', status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalEarned = earningsAgg[0]?.total || 0;

        const payoutAgg = await Transaction.aggregate([
            { $match: { partnerId: partnerId, type: 'payout', status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalPaidOut = payoutAgg[0]?.total || 0;

        const pendingPayoutAgg = await Transaction.aggregate([
            { $match: { partnerId: partnerId, type: 'payout', status: 'pending' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const pendingPayout = pendingPayoutAgg[0]?.total || 0;

        const balance = totalEarned - (totalPaidOut + pendingPayout);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayEarningsAgg = await Transaction.aggregate([
            { $match: { partnerId: partnerId, type: 'credit', createdAt: { $gte: today } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const todayEarnings = todayEarningsAgg[0]?.total || 0;

        res.json({
            success: true,
            data: {
                currentBalance: balance,
                totalEarnings: totalEarned,
                todayEarnings: todayEarnings,
                pendingPayout: pendingPayout,
                weeklyEarnings: 0,
                monthlyEarnings: 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get transactions
// @route   GET /api/v1/wallet/partner/transactions
// @access  Private (Partner)
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ partnerId: req.partner._id })
            .sort({ createdAt: -1 });

        res.json({ success: true, data: { transactions, totalCount: transactions.length, page: 1, limit: transactions.length } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Request payout
// @route   POST /api/v1/wallet/partner/payout
// @access  Private (Partner)
const requestPayout = async (req, res) => {
    try {
        const { amount, bankAccountId, otp } = req.body;
        const partnerId = req.partner._id;
        
        if (!amount || amount < 500) {
            return res.status(400).json({ success: false, message: 'Minimum payout amount is ₹500' });
        }
        
        if (!bankAccountId) {
            return res.status(400).json({ success: false, message: 'Please select a bank account' });
        }
        
        // OTP Validation
        const partner = await Partner.findById(partnerId).select('+otp +otpExpires');
        if (!otp || partner.otp !== otp || partner.otpExpires < Date.now()) {
            return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // Calculate available balance
        const earningsAgg = await Transaction.aggregate([
            { $match: { partnerId: partnerId, type: 'credit', status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalEarned = earningsAgg[0]?.total || 0;

        const payoutAgg = await Transaction.aggregate([
            { $match: { partnerId: partnerId, type: 'payout', status: { $in: ['completed', 'pending'] } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalDeductions = payoutAgg[0]?.total || 0;

        const availableBalance = totalEarned - totalDeductions;
        
        if (amount > availableBalance) {
            return res.status(400).json({ success: false, message: `Requested amount exceeds available balance (₹${availableBalance})` });
        }

        // Create pending payout transaction
        let transaction;
        try {
            transaction = await Transaction.create({
                partnerId,
                type: 'payout',
                amount: amount,
                status: 'pending',
                bankAccountId: bankAccountId,
                description: `Payout request for ₹${amount}`
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ success: false, message: 'You already have a pending payout request' });
            }
            throw error;
        }

        // Clear OTP after successful validation
        partner.otp = undefined;
        partner.otpExpires = undefined;
        await partner.save();

        res.json({
            success: true,
            data: {
                payoutId: transaction._id,
                amount: transaction.amount,
                status: transaction.status,
                estimatedArrival: new Date(Date.now() + 86400000).toISOString()
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get Bank Accounts
// @route   GET /api/v1/wallet/partner/bank-accounts
// @access  Private (Partner)
const getBankAccounts = async (req, res) => {
    try {
        const partner = await Partner.findById(req.partner._id);
        const activeAccounts = partner.bankAccounts.filter(b => b.isActive).map(b => ({
            id: b._id,
            bankName: b.bankName,
            accountNumber: b.accountNumber,
            ifsc: b.ifsc,
            accountHolderName: b.accountHolderName,
            isPrimary: b.isPrimary
        }));
        res.json({ success: true, data: activeAccounts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add Bank Account
// @route   POST /api/v1/wallet/partner/bank-accounts
// @access  Private (Partner)
const addBankAccount = async (req, res) => {
    try {
        const { bankName, accountNumber, ifsc, accountHolderName, otp } = req.body;
        
        const partner = await Partner.findById(req.partner._id).select('+otp +otpExpires');
        
        // Financial Security Guard: Verify OTP
        if (!otp || partner.otp !== otp || partner.otpExpires < Date.now()) {
            return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
        }

        const isFirst = partner.bankAccounts.filter(b => b.isActive).length === 0;
        
        partner.bankAccounts.push({
            bankName,
            accountNumber,
            ifsc,
            accountHolderName,
            isPrimary: isFirst,
            isActive: true
        });

        // Clear OTP after successful validation
        partner.otp = undefined;
        partner.otpExpires = undefined;

        await partner.save();
        
        const newAccount = partner.bankAccounts[partner.bankAccounts.length - 1];
        
        res.status(201).json({
            success: true,
            data: {
                id: newAccount._id,
                bankName: newAccount.bankName,
                accountNumber: newAccount.accountNumber,
                ifsc: newAccount.ifsc,
                accountHolderName: newAccount.accountHolderName,
                isPrimary: newAccount.isPrimary
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Set Primary Bank Account
// @route   PUT /api/v1/wallet/partner/bank-accounts/:id/primary
// @access  Private (Partner)
const setPrimaryBankAccount = async (req, res) => {
    try {
        const bankAccountId = req.params.id;
        
        const partner = await Partner.findById(req.partner._id);
        const bankAccount = partner.bankAccounts.find(acc => acc._id.toString() === bankAccountId);
        
        if (!bankAccount) {
            return res.status(404).json({ success: false, message: 'Bank account not found' });
        }
        
        if (!bankAccount.isActive) {
            return res.status(400).json({ success: false, message: 'Cannot set inactive bank account as primary' });
        }

        // Step 1: Set all accounts to false
        await Partner.updateOne(
            { _id: req.partner._id, "bankAccounts.isPrimary": true },
            { $set: { "bankAccounts.$[].isPrimary": false } }
        );
        
        // Step 2: Set the target account to true
        const result = await Partner.updateOne(
            { _id: req.partner._id, "bankAccounts._id": bankAccountId, "bankAccounts.isActive": true },
            { $set: { "bankAccounts.$.isPrimary": true } }
        );
        
        if (result.matchedCount === 0) {
            return res.status(400).json({ success: false, message: 'Failed to update: target bank account not found or is inactive' });
        }
        
        res.json({ success: true, message: 'Primary bank account updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete Bank Account
// @route   DELETE /api/v1/wallet/partner/bank-accounts/:id
// @access  Private (Partner)
const deleteBankAccount = async (req, res) => {
    try {
        const bankAccountId = req.params.id;
        
        // Guard: Prevent deletion if tied to a pending payout
        const pendingPayout = await Transaction.findOne({
            partnerId: req.partner._id,
            bankAccountId: bankAccountId,
            status: 'pending',
            type: 'payout'
        });
        
        if (pendingPayout) {
            return res.status(400).json({ success: false, message: 'Cannot delete bank account tied to a pending payout' });
        }
        
        const partner = await Partner.findById(req.partner._id);
        const account = partner.bankAccounts.id(bankAccountId);
        
        if (!account || !account.isActive) {
            return res.status(404).json({ success: false, message: 'Bank account not found' });
        }

        const wasPrimary = account.isPrimary;
        
        // Soft delete
        await Partner.updateOne(
            { _id: req.partner._id, "bankAccounts._id": bankAccountId },
            { $set: { "bankAccounts.$.isActive": false, "bankAccounts.$.isPrimary": false } }
        );
        
        // If it was primary, reassign primary to oldest active
        if (wasPrimary) {
            const updatedPartner = await Partner.findById(req.partner._id);
            const oldestActive = updatedPartner.bankAccounts.find(b => b.isActive);
            if (oldestActive) {
                await Partner.updateOne(
                    { _id: req.partner._id, "bankAccounts._id": oldestActive._id },
                    { $set: { "bankAccounts.$.isPrimary": true } }
                );
            }
        }
        
        res.json({ success: true, message: 'Bank account deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Payout History
// @route   GET /api/v1/wallet/partner/payouts
// @access  Private (Partner)
const getPayoutHistory = async (req, res) => {
    try {
        const payouts = await Transaction.find({ partnerId: req.partner._id, type: 'payout' })
            .sort({ createdAt: -1 });

        res.json({ success: true, data: { transactions: payouts, totalCount: payouts.length, page: 1, limit: payouts.length } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get Earnings by Period
// @route   GET /api/v1/wallet/partner/earnings
// @access  Private (Partner)
const getEarningsByPeriod = async (req, res) => {
    try {
        const { period } = req.query; // 'weekly', 'monthly', 'today'
        const partnerId = req.partner._id;
        
        let matchDate = new Date();
        if (period === 'weekly') {
            matchDate.setDate(matchDate.getDate() - 7);
        } else if (period === 'monthly') {
            matchDate.setMonth(matchDate.getMonth() - 1);
        } else {
            matchDate.setHours(0, 0, 0, 0); // today
        }
        
        const earningsAgg = await Transaction.aggregate([
            {
                $match: {
                    partnerId: partnerId,
                    type: 'credit',
                    status: 'completed',
                    createdAt: { $gte: matchDate }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);
        
        res.json({ success: true, data: { earnings: earningsAgg[0]?.total || 0 } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Earnings Breakdown
// @route   GET /api/v1/wallet/partner/earnings/breakdown
// @access  Private (Partner)
const getEarningsBreakdown = async (req, res) => {
    try {
        const { period } = req.query;
        const partnerId = req.partner._id;
        
        let matchDate = new Date();
        if (period === 'weekly') {
            matchDate.setDate(matchDate.getDate() - 7);
        } else if (period === 'monthly') {
            matchDate.setMonth(matchDate.getMonth() - 1);
        } else {
            matchDate.setHours(0, 0, 0, 0); // today
        }
        
        const breakdown = await Transaction.aggregate([
            {
                $match: {
                    partnerId: partnerId,
                    type: 'credit',
                    status: 'completed',
                    createdAt: { $gte: matchDate }
                }
            },
            {
                $lookup: {
                    from: 'servicerequests',
                    localField: 'jobId',
                    foreignField: '_id',
                    as: 'job'
                }
            },
            { $unwind: '$job' },
            {
                $lookup: {
                    from: 'servicecategories',
                    localField: 'job.serviceId',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            {
                $group: {
                    _id: '$category.name',
                    amount: { $sum: '$amount' },
                    jobCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    category: '$_id',
                    amount: 1,
                    jobCount: 1
                }
            }
        ]);
        
        res.json({ success: true, data: breakdown });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get transaction by ID
// @route   GET /api/v1/wallet/partner/transactions/:id
// @access  Private (Partner)
const getTransactionById = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        // Enrich details with populated booking specifications and nested client info
        const transaction = await Transaction.findById(req.params.id)
            .populate({
                path: 'jobId',
                select: 'serviceType serviceName status finalCharges',
                populate: { path: 'clientId', select: 'name phone' }
            });

        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        // Verify ownership
        if (transaction.partnerId.toString() !== req.partner._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized to view this transaction' });
        }

        res.json({
            success: true,
            data: transaction
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    getWalletSummary,
    getTransactions,
    requestPayout,
    getBankAccounts,
    addBankAccount,
    setPrimaryBankAccount,
    deleteBankAccount,
    getPayoutHistory,
    getEarningsByPeriod,
    getEarningsBreakdown,
    getTransactionById
};