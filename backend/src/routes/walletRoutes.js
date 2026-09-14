const express = require('express');
const router = express.Router();
const { protectPartner } = require('../middleware/authMiddleware');
const {
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
} = require('../controllers/walletController');

router.get('/partner', protectPartner, getWalletSummary);
router.get('/partner/transactions', protectPartner, getTransactions);
router.get('/partner/transactions/:id', protectPartner, getTransactionById);
router.post('/partner/payout', protectPartner, requestPayout);
router.get('/partner/payouts', protectPartner, getPayoutHistory);
router.get('/partner/bank-accounts', protectPartner, getBankAccounts);
router.post('/partner/bank-accounts', protectPartner, addBankAccount);
router.put('/partner/bank-accounts/:id/primary', protectPartner, setPrimaryBankAccount);
router.delete('/partner/bank-accounts/:id', protectPartner, deleteBankAccount);
router.get('/partner/earnings', protectPartner, getEarningsByPeriod);
router.get('/partner/earnings/breakdown', protectPartner, getEarningsBreakdown);

module.exports = router;
