// backend/tests/phase3-cancellation.js
const {
    config,
    printHeader,
    printPass,
    printFail,
    printInfo,
    printVerify,
    waitForUser,
    apiRequest,
    loginClient,
    loginPartner
} = require('./runner-helper');

async function runPhase3() {
    printHeader('PHASE 3: CANCELLATION & REJECTION FLOWS');

    let clientAuth, partnerAuth;
    try {
        clientAuth = await loginClient();
        partnerAuth = await loginPartner();
    } catch (err) {
        printFail('Pre-test login failed', err.message);
        return;
    }

    async function createTestRequest(notes = 'Test request for cancellation') {
        // Ensure partner is online before creating a request
        await apiRequest('/partner/status', 'PUT', { status: 'online' }, partnerAuth.token);
        
        const res = await apiRequest('/requests', 'POST', {
            serviceId: config.serviceCategory.id,
            partnerId: config.partnerCredentials.id,
            bookingType: 'instant',
            notes,
            address: {
                full: 'Test Address 123, Noida',
                city: 'Noida',
                pincode: '201301',
                lat: 28.6273,
                lng: 77.3725
            }
        }, clientAuth.token);
        const reqId = res.data?.data?._id || res.data?.data?.id;
        if (!reqId) {
            console.error('Failed to create request response:', res.data);
            throw new Error(`Failed to create test request: ${res.data?.message || res.error}`);
        }
        return reqId;
    }

    // 3.1 Client cancels PENDING request
    console.log('🔹 Test 3.1: Client Cancels PENDING Request');
    const reqId1 = await createTestRequest('Pending cancellation test');
    if (!reqId1) {
        printFail('Failed to create test request 1');
        return;
    }

    printVerify('Partner App: Request modal is open. DO NOT accept or decline. Watch it dismiss automatically in 2 seconds...');
    await new Promise(r => setTimeout(r, 1000));

    const cancelRes1 = await apiRequest(`/requests/${reqId1}/cancel`, 'PUT', {}, clientAuth.token);
    if (cancelRes1.ok && cancelRes1.data.data.status === 'cancelled') {
        printPass('Client successfully cancelled PENDING request');
    } else {
        printFail('Failed to cancel pending request', cancelRes1.data?.message);
    }

    printVerify('Partner App: Verify incoming request modal dismissed automatically via socket event! No stale modal remains.');
    await waitForUser();

    // 3.2 Client cancels ACCEPTED request
    console.log('\n🔹 Test 3.2: Client Cancels ACCEPTED Request');
    const reqId2 = await createTestRequest('Accepted cancellation test');
    await apiRequest(`/jobs/${reqId2}/status`, 'PUT', { status: 'accepted' }, partnerAuth.token);

    printVerify('Partner App: Job is currently ACCEPTED. Watch for cancellation alert...');
    await new Promise(r => setTimeout(r, 1000));

    const cancelRes2 = await apiRequest(`/requests/${reqId2}/cancel`, 'PUT', {}, clientAuth.token);
    if (cancelRes2.ok && cancelRes2.data.data.status === 'cancelled') {
        printPass('Client successfully cancelled ACCEPTED request');
    } else {
        printFail('Failed to cancel accepted request', cancelRes2.data?.message);
    }

    printVerify('Partner App: Alert "Client Cancelled 🚫" pops up and UI refreshes dashboard cleanly.');
    await waitForUser();

    // 3.3 Client CANNOT cancel IN_PROGRESS job
    console.log('\n🔹 Test 3.3: Client Cannot Cancel IN_PROGRESS Job');
    const reqId3 = await createTestRequest('In-progress cancellation test');
    await apiRequest(`/jobs/${reqId3}/status`, 'PUT', { status: 'accepted' }, partnerAuth.token);
    await apiRequest(`/jobs/${reqId3}/status`, 'PUT', { status: 'reached' }, partnerAuth.token);
    await apiRequest(`/jobs/${reqId3}/status`, 'PUT', { status: 'in_progress' }, partnerAuth.token);

    const cancelRes3 = await apiRequest(`/requests/${reqId3}/cancel`, 'PUT', {}, clientAuth.token);
    if (cancelRes3.status === 400) {
        printPass('Server correctly blocked client from cancelling IN_PROGRESS job with HTTP 400');
    } else {
        printFail(`Expected HTTP 400 error, got HTTP ${cancelRes3.status}`, cancelRes3.data?.message);
    }

    // Cleanup req3 by completing it
    await apiRequest(`/jobs/${reqId3}/status`, 'PUT', { status: 'completed', notes: 'Cleanup completed' }, partnerAuth.token);

    // 3.4 Partner REJECTS pending job
    console.log('\n🔹 Test 3.4: Partner Rejects Pending Job');
    const reqId4 = await createTestRequest('Partner rejection test');

    printVerify('Client App: Request created. Watch tracking screen update when partner declines...');
    await new Promise(r => setTimeout(r, 1000));

    const rejectRes = await apiRequest(`/jobs/${reqId4}/reject`, 'POST', { reason: 'Partner busy with emergency' }, partnerAuth.token);
    if (rejectRes.ok && rejectRes.data.success) {
        printPass('Partner rejected pending job successfully via POST /jobs/:id/reject');
    } else {
        printFail('Failed to reject job', rejectRes.data?.message);
    }

    printVerify('Client App: Tracking screen updates to "Service Partner Unavailable 😞" with a button to select another partner.');
    await waitForUser();

    // 3.5 Partner CANCELS accepted job
    console.log('\n🔹 Test 3.5: Partner Cancels Accepted Job');
    const reqId5 = await createTestRequest('Partner cancel accepted test');
    await apiRequest(`/jobs/${reqId5}/status`, 'PUT', { status: 'accepted' }, partnerAuth.token);

    const partnerCancelRes = await apiRequest(`/jobs/${reqId5}/status`, 'PUT', { status: 'cancelled' }, partnerAuth.token);
    if (partnerCancelRes.ok && partnerCancelRes.data.data.status === 'cancelled') {
        printPass('Partner cancelled accepted job successfully');
    } else {
        printFail('Partner cancel job failed', partnerCancelRes.data?.message);
    }

    printVerify('Client App: Tracking screen detects cancellation and displays unavailable status.');
    await waitForUser();

    // 3.6 Double Cancel Prevention
    console.log('\n🔹 Test 3.6: Double Cancel Prevention');
    const doubleCancelRes = await apiRequest(`/requests/${reqId5}/cancel`, 'PUT', {}, clientAuth.token);
    if (doubleCancelRes.status === 400) {
        printPass('Server correctly rejected second cancel request on already-cancelled job');
    } else {
        printFail(`Expected HTTP 400 for double cancel, got ${doubleCancelRes.status}`);
    }

    // 3.7 Cancel Non-existent Job
    console.log('\n🔹 Test 3.7: Cancel Non-Existent Job ID');
    const fakeId = '609e023456789abcdef01234';
    const fakeRes = await apiRequest(`/requests/${fakeId}/cancel`, 'PUT', {}, clientAuth.token);
    if (fakeRes.status === 404) {
        printPass('Server correctly returned HTTP 404 for invalid job ID');
    } else {
        printFail(`Expected HTTP 404, got ${fakeRes.status}`);
    }

    console.log('\n🎉 PHASE 3 CANCELLATION TESTS COMPLETE!\n');
}

runPhase3();
