// backend/tests/phase2-happy-path.js
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

async function runPhase2() {
    printHeader('PHASE 2: HAPPY PATH FULL BOOKING LIFECYCLE');

    let clientAuth, partnerAuth;
    try {
        clientAuth = await loginClient();
        partnerAuth = await loginPartner();
    } catch (err) {
        printFail('Pre-test login failed', err.message);
        return;
    }

    // 2.1 Set Partner Online
    console.log('🔹 Step 2.1: Set Partner Status ONLINE');
    const onlineRes = await apiRequest('/partner/status', 'PUT', { status: 'online' }, partnerAuth.token);
    if (onlineRes.ok && onlineRes.data.data?.status === 'online') {
        printPass('Partner is set to ONLINE in backend');
    } else {
        printFail('Failed to set partner online', onlineRes.data?.message);
    }

    printVerify('Partner App: Check that the Online toggle button is ON (Online state).');
    await waitForUser();

    // 2.2 Client Fetches Services
    console.log('\n🔹 Step 2.2: Client Fetches Available Services');
    const servicesRes = await apiRequest('/requests/services', 'GET');
    if (servicesRes.ok && Array.isArray(servicesRes.data.data) && servicesRes.data.data.length > 0) {
        printPass(`Fetched ${servicesRes.data.data.length} services from catalog`);
        printInfo(`First service: ${servicesRes.data.data[0].name} (ID: ${servicesRes.data.data[0].id})`);
    } else {
        printFail('Failed to fetch services catalog');
    }

    // 2.3 Client Creates Instant Request
    console.log('\n🔹 Step 2.3: Client Creates Instant Request');
    const requestPayload = {
        serviceId: config.serviceCategory.id,
        partnerId: config.partnerCredentials.id,
        bookingType: 'instant',
        notes: 'Leaking pipe under kitchen sink. Please hurry!',
        address: {
            full: 'Flat 402, Building B, Sector 62, Noida',
            landmark: 'Opposite Metro Station',
            city: 'Noida',
            pincode: '201301',
            lat: 28.6273,
            lng: 77.3725
        }
    };

    const createRes = await apiRequest('/requests', 'POST', requestPayload, clientAuth.token);
    let jobId = null;

    if (createRes.status === 201 && createRes.data.success) {
        jobId = createRes.data.data._id;
        printPass(`Job created successfully with ID: ${jobId}`);
        printInfo(`Booking Type: ${createRes.data.data.bookingType}, Status: ${createRes.data.data.status}`);
    } else {
        printFail('Failed to create instant request', createRes.data?.message);
        return;
    }

    printVerify(`Partner App: An INCOMING JOB MODAL should pop up with sound/vibration and 60s timer!
     Verify details: "Plumbing Services", "Flat 402...", "Leaking pipe under kitchen sink".`);
    await waitForUser();

    // 2.4 Client Check Active Request
    console.log('\n🔹 Step 2.4: Client Fetches Active Request');
    const activeRes = await apiRequest('/requests/active', 'GET', null, clientAuth.token);
    if (activeRes.ok && activeRes.data.data && activeRes.data.data._id === jobId) {
        printPass(`Client active request matched job ID ${jobId}`);
    } else {
        printFail('Client active request query failed or mismatched', activeRes.data?.message);
    }

    printVerify('Client App: Check that UI automatically navigated to Tracking Screen (Searching / Partner Assigned state).');
    await waitForUser();

    // 2.5 Partner Accepts Job
    console.log('\n🔹 Step 2.5: Partner Accepts Job');
    const acceptRes = await apiRequest(`/jobs/${jobId}/status`, 'PUT', { status: 'accepted' }, partnerAuth.token);
    if (acceptRes.ok && acceptRes.data.data.status === 'accepted') {
        printPass('Job status updated to ACCEPTED');
    } else {
        printFail('Failed to accept job', acceptRes.data?.message);
    }

    printVerify(`Partner App: Should auto-navigate to Job Execution Screen with step "Reached Location".
     Client App: Tracking Screen should update to "Partner Accepted" with call & direction buttons.`);
    await waitForUser();

    // 2.6 Partner Reaches Location
    console.log('\n🔹 Step 2.6: Partner Marks Reached Location');
    const reachedRes = await apiRequest(`/jobs/${jobId}/status`, 'PUT', { status: 'reached' }, partnerAuth.token);
    if (reachedRes.ok && reachedRes.data.data.status === 'reached') {
        printPass('Job status updated to REACHED');
    } else {
        printFail('Failed to update status to reached', reachedRes.data?.message);
    }

    printVerify(`Partner App: Button text changes to "Start Service".
     Client App: Status updates to "Partner Arrived at Location".`);
    await waitForUser();

    // 2.7 Partner Starts Service
    console.log('\n🔹 Step 2.7: Partner Starts Service');
    const startRes = await apiRequest(`/jobs/${jobId}/status`, 'PUT', { status: 'in_progress' }, partnerAuth.token);
    if (startRes.ok && startRes.data.data.status === 'in_progress') {
        printPass('Job status updated to IN_PROGRESS');
    } else {
        printFail('Failed to update status to in_progress', startRes.data?.message);
    }

    printVerify(`Partner App: Button text changes to "Complete Job".
     Client App: Status updates to "Service In Progress 🔨".`);
    await waitForUser();

    // 2.8 Partner Completes Job
    console.log('\n🔹 Step 2.8: Partner Completes Job');
    const completeRes = await apiRequest(`/jobs/${jobId}/status`, 'PUT', {
        status: 'completed',
        notes: 'Fixed main washer seal and tightened joint. No more leaks.'
    }, partnerAuth.token);

    if (completeRes.ok && completeRes.data.data.status === 'completed') {
        printPass(`Job completed successfully! Final charges: ₹${completeRes.data.data.finalPrice}`);
    } else {
        printFail('Failed to complete job', completeRes.data?.message);
    }

    printVerify(`Partner App: Job execution finishes and navigates back to Dashboard.
     Client App: Review Modal / Screen pops up asking for rating & feedback.`);
    await waitForUser();

    // 2.9 Client Submits Review
    console.log('\n🔹 Step 2.9: Client Submits Review');
    const reviewRes = await apiRequest(`/requests/${jobId}/review`, 'POST', {
        rating: 5,
        feedback: 'Excellent work! Reached quickly and fixed the pipe in 15 minutes.',
        tags: ['Punctual', 'Professional', 'Clean Work']
    }, clientAuth.token);

    if (reviewRes.ok && reviewRes.data.success) {
        printPass('Client submitted 5-star review successfully');
    } else {
        printFail('Failed to submit review', reviewRes.data?.message);
    }

    printVerify('Client App: Review modal dismisses. Check Request History tab to see the completed request with 5 stars.');
    await waitForUser();

    // 2.10 Check Partner Wallet
    console.log('\n🔹 Step 2.10: Verify Partner Wallet Credit');
    const walletRes = await apiRequest('/wallet/partner', 'GET', null, partnerAuth.token);
    if (walletRes.ok && walletRes.data.success) {
        printPass(`Partner Wallet Summary: Total Earnings = ₹${walletRes.data.data.totalEarnings || 0}, Current Balance = ₹${walletRes.data.data.balance || 0}`);
    } else {
        printFail('Failed to fetch wallet summary', walletRes.data?.message);
    }

    printVerify('Partner App: Navigate to Wallet screen. Verify that the recent job payment appears in transactions log.');
    await waitForUser();

    console.log('\n🎉 PHASE 2 HAPPY PATH COMPLETE!\n');
}

runPhase2();
