// backend/tests/phase4-state-machine.js
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

async function runPhase4() {
    printHeader('PHASE 4: STATE MACHINE & EDGE CASES');

    let clientAuth, partnerAuth;
    try {
        clientAuth = await loginClient();
        partnerAuth = await loginPartner();
    } catch (err) {
        printFail('Pre-test login failed', err.message);
        return;
    }

    // Ensure partner is ONLINE for state machine tests
    await apiRequest('/partner/status', 'PUT', { status: 'online' }, partnerAuth.token);

    async function createTestRequest() {
        // Ensure online state
        await apiRequest('/partner/status', 'PUT', { status: 'online' }, partnerAuth.token);
        const res = await apiRequest('/requests', 'POST', {
            serviceId: config.serviceCategory.id,
            partnerId: config.partnerCredentials.id,
            bookingType: 'instant',
            notes: 'State machine test request',
            address: {
                full: 'Sector 62, Noida',
                city: 'Noida',
                pincode: '201301',
                lat: 28.6273,
                lng: 77.3725
            }
        }, clientAuth.token);
        const reqId = res.data?.data?._id || res.data?.data?.id;
        if (!reqId) {
            throw new Error(`Failed to create test request: ${res.data?.message || res.error}`);
        }
        return reqId;
    }

    // 4.1 Skip state: pending -> in_progress
    console.log('🔹 Test 4.1: Illegal Skip (Pending -> In Progress)');
    const reqId1 = await createTestRequest();
    const skipRes1 = await apiRequest(`/jobs/${reqId1}/status`, 'PUT', { status: 'in_progress' }, partnerAuth.token);
    if (skipRes1.status === 400) {
        printPass(`Server rejected invalid transition pending -> in_progress: "${skipRes1.data?.message}"`);
    } else {
        printFail(`Expected HTTP 400, got ${skipRes1.status}`);
    }

    // 4.2 Skip state: accepted -> completed
    console.log('\n🔹 Test 4.2: Illegal Skip (Accepted -> Completed)');
    await apiRequest(`/jobs/${reqId1}/status`, 'PUT', { status: 'accepted' }, partnerAuth.token);
    const skipRes2 = await apiRequest(`/jobs/${reqId1}/status`, 'PUT', { status: 'completed' }, partnerAuth.token);
    if (skipRes2.status === 400) {
        printPass(`Server rejected invalid transition accepted -> completed: "${skipRes2.data?.message}"`);
    } else {
        printFail(`Expected HTTP 400, got ${skipRes2.status}`);
    }

    // 4.3 Backward state regression: accepted -> pending
    console.log('\n🔹 Test 4.3: Backward State Regression (Accepted -> Pending)');
    const regressRes = await apiRequest(`/jobs/${reqId1}/status`, 'PUT', { status: 'pending' }, partnerAuth.token);
    if (regressRes.status === 400) {
        printPass(`Server rejected backward state transition: "${regressRes.data?.message}"`);
    } else {
        printFail(`Expected HTTP 400, got ${regressRes.status}`);
    }

    // 4.4 Double accept (Idempotent check)
    console.log('\n🔹 Test 4.4: Idempotent Double Accept');
    const doubleAcceptRes = await apiRequest(`/jobs/${reqId1}/status`, 'PUT', { status: 'accepted' }, partnerAuth.token);
    if (doubleAcceptRes.ok && doubleAcceptRes.data.data.status === 'accepted') {
        printPass('Server handled duplicate accept gracefully without error (Idempotent)');
    } else {
        printFail('Double accept failed', doubleAcceptRes.data?.message);
    }

    // Progress reqId1 to completed normally
    await apiRequest(`/jobs/${reqId1}/status`, 'PUT', { status: 'reached' }, partnerAuth.token);
    await apiRequest(`/jobs/${reqId1}/status`, 'PUT', { status: 'in_progress' }, partnerAuth.token);
    await apiRequest(`/jobs/${reqId1}/status`, 'PUT', { status: 'completed', notes: 'Done' }, partnerAuth.token);

    // 4.5 Terminal state check: completed -> accepted
    console.log('\n🔹 Test 4.5: Attempt Transition from Terminal State (Completed -> Accepted)');
    const terminalRes = await apiRequest(`/jobs/${reqId1}/status`, 'PUT', { status: 'accepted' }, partnerAuth.token);
    if (terminalRes.status === 400) {
        printPass(`Server correctly blocked transition from terminal completed state: "${terminalRes.data?.message}"`);
    } else {
        printFail(`Expected HTTP 400 for terminal state transition, got ${terminalRes.status}`);
    }

    // 4.6 Booking an OFFLINE partner
    console.log('\n🔹 Test 4.6: Instant Booking for Offline Partner');
    // Set partner offline
    await apiRequest('/partner/status', 'PUT', { status: 'offline' }, partnerAuth.token);

    const offlineBookingRes = await apiRequest('/requests', 'POST', {
        serviceId: config.serviceCategory.id,
        partnerId: config.partnerCredentials.id,
        bookingType: 'instant',
        notes: 'Offline partner booking test',
        address: { full: 'Test Address', city: 'Noida', pincode: '201301' }
    }, clientAuth.token);

    if (offlineBookingRes.status === 400 && offlineBookingRes.data?.message?.includes('offline')) {
        printPass(`Server correctly blocked instant booking for offline partner: "${offlineBookingRes.data.message}"`);
    } else {
        printFail('Server allowed instant booking for offline partner or returned wrong error', offlineBookingRes.data?.message);
    }

    // Turn partner back ONLINE
    await apiRequest('/partner/status', 'PUT', { status: 'online' }, partnerAuth.token);

    // 4.7 Today's Summary Verification
    console.log('\n🔹 Test 4.7: Verify Today\'s Summary Metrics');
    const summaryRes = await apiRequest('/jobs/today-summary', 'GET', null, partnerAuth.token);
    if (summaryRes.ok && summaryRes.data.success) {
        printPass(`Today Summary Metrics: Total Jobs = ${summaryRes.data.data.totalJobs}, Completed = ${summaryRes.data.data.completedJobs}, Earnings = ₹${summaryRes.data.data.totalEarnings}`);
    } else {
        printFail('Failed to fetch today\'s summary', summaryRes.data?.message);
    }

    console.log('\n🎉 PHASE 4 STATE MACHINE TESTS COMPLETE!\n');
}

runPhase4();
