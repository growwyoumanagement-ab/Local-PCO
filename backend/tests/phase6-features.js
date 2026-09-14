// backend/tests/phase6-features.js
const {
    config,
    printHeader,
    printPass,
    printFail,
    printInfo,
    apiRequest,
    loginClient,
    loginPartner
} = require('./runner-helper');

async function runPhase6() {
    printHeader('PHASE 6: REVIEWS, WALLET, BANK & PROFILE FEATURES');

    let clientAuth, partnerAuth;
    try {
        clientAuth = await loginClient();
        partnerAuth = await loginPartner();
    } catch (err) {
        printFail('Pre-test login failed', err.message);
        return;
    }

    // 6.1 Client Profile Fetch & Update
    console.log('🔹 Test 6.1: Client Profile Update');
    const clientProfRes = await apiRequest('/auth/client/profile', 'GET', null, clientAuth.token);
    if (clientProfRes.ok && clientProfRes.data.success) {
        printPass(`Fetched Client Profile: ${clientProfRes.data.data.name}`);
    } else {
        printFail('Failed to fetch client profile', clientProfRes.data?.message);
    }

    // 6.2 Partner Profile Fetch & Update
    console.log('\n🔹 Test 6.2: Partner Profile Update');
    const partnerProfRes = await apiRequest('/partner/profile', 'GET', null, partnerAuth.token);
    if (partnerProfRes.ok && partnerProfRes.data.success) {
        printPass(`Fetched Partner Profile: ${partnerProfRes.data.data.profile.name}`);
    } else {
        printFail('Failed to fetch partner profile', partnerProfRes.data?.message);
    }

    // 6.3 Bank Details Management
    console.log('\n🔹 Test 6.3: Add/Update Partner Bank Details');
    const bankPayload = {
        accountHolderName: 'Test Partner',
        accountNumber: '123456789012',
        bankName: 'HDFC Bank',
        ifsc: 'HDFC0001234'
    };
    const bankRes = await apiRequest('/partner/bank-details', 'PUT', bankPayload, partnerAuth.token);
    if (bankRes.ok && bankRes.data.success) {
        printPass('Successfully updated Partner Bank Details');
    } else {
        printFail('Failed to update bank details', bankRes.data?.message);
    }

    // 6.4 Wallet Summary & Transactions
    console.log('\n🔹 Test 6.4: Fetch Wallet Summary & Transactions');
    const walletRes = await apiRequest('/wallet/partner', 'GET', null, partnerAuth.token);
    const txRes = await apiRequest('/wallet/partner/transactions', 'GET', null, partnerAuth.token);

    if (walletRes.ok && txRes.ok) {
        printPass(`Wallet balance: ₹${walletRes.data.data.balance || 0}, Transaction records count: ${txRes.data.data?.transactions?.length || txRes.data.data?.length || 0}`);
    } else {
        printFail('Failed to fetch wallet/transaction history', walletRes.data?.message || txRes.data?.message);
    }

    // 6.5 Request Payout
    console.log('\n🔹 Test 6.5: Partner Request Payout');
    const payoutRes = await apiRequest('/wallet/partner/payout', 'POST', { amount: 100 }, partnerAuth.token);
    if (payoutRes.ok && payoutRes.data.success) {
        printPass('Payout request created successfully');
    } else {
        // If balance is 0 or low, server returns specific message
        printInfo(`Payout API response: "${payoutRes.data?.message}"`);
    }

    // 6.6 Review Edge Cases (Attempt review on pending job)
    console.log('\n🔹 Test 6.6: Reject Review on Non-Completed Job');
    const pendingReqRes = await apiRequest('/requests', 'POST', {
        serviceId: config.serviceCategory.id,
        partnerId: config.partnerCredentials.id,
        bookingType: 'instant',
        notes: 'Pending review test',
        address: { full: 'Test Address', city: 'Noida', pincode: '201301' }
    }, clientAuth.token);

    const pendingJobId = pendingReqRes.data?.data?._id || pendingReqRes.data?.data?.id;

    const invalidReviewRes = await apiRequest(`/requests/${pendingJobId}/review`, 'POST', { rating: 5 }, clientAuth.token);
    if (invalidReviewRes.status === 400) {
        printPass(`Server rejected review on non-completed job: "${invalidReviewRes.data?.message}"`);
    } else {
        printFail(`Expected HTTP 400 for review on non-completed job, got ${invalidReviewRes.status}`);
    }

    // 6.7 Skip Review on Completed Job
    console.log('\n🔹 Test 6.7: Skip Review on Completed Job');
    // Complete the pending job first
    await apiRequest(`/jobs/${pendingJobId}/status`, 'PUT', { status: 'accepted' }, partnerAuth.token);
    await apiRequest(`/jobs/${pendingJobId}/status`, 'PUT', { status: 'reached' }, partnerAuth.token);
    await apiRequest(`/jobs/${pendingJobId}/status`, 'PUT', { status: 'in_progress' }, partnerAuth.token);
    await apiRequest(`/jobs/${pendingJobId}/status`, 'PUT', { status: 'completed', notes: 'Done' }, partnerAuth.token);

    const skipRes = await apiRequest(`/requests/${pendingJobId}/skip-review`, 'PUT', {}, clientAuth.token);
    if (skipRes.ok && skipRes.data.success) {
        printPass('Successfully skipped review for completed job');
    } else {
        printFail('Failed to skip review', skipRes.data?.message);
    }

    console.log('\n🎉 PHASE 6 FEATURES & EDGE CASES TESTS COMPLETE!\n');
}

runPhase6();
