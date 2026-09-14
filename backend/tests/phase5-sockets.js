// backend/tests/phase5-sockets.js
const { io } = require('socket.io-client');
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

const SOCKET_URL = 'http://localhost:5000';

async function runPhase5() {
    printHeader('PHASE 5: REAL-TIME SOCKET.IO EVENT INTEGRATION');

    let clientAuth, partnerAuth;
    try {
        clientAuth = await loginClient();
        partnerAuth = await loginPartner();
    } catch (err) {
        printFail('Pre-test login failed', err.message);
        return;
    }

    // 5.1 Invalid Socket Token Connection
    console.log('🔹 Test 5.1: Socket Handshake Auth Guard');
    const badSocket = io(SOCKET_URL, {
        auth: { token: 'invalid_token_123' },
        transports: ['websocket'],
        reconnection: false
    });

    await new Promise((resolve) => {
        badSocket.on('connect_error', (err) => {
            printPass(`Socket correctly rejected invalid token: "${err.message}"`);
            badSocket.disconnect();
            resolve();
        });
        badSocket.on('connect', () => {
            printFail('Socket allowed connection with invalid token!');
            badSocket.disconnect();
            resolve();
        });
    });

    // Connect valid partner socket
    console.log('\n🔹 Connecting Test Partner Socket...');
    const partnerSocket = io(SOCKET_URL, {
        auth: { token: partnerAuth.token, userType: 'partner' },
        transports: ['websocket']
    });

    await new Promise((resolve) => {
        partnerSocket.on('connect', () => {
            printPass(`Partner socket connected (ID: ${partnerSocket.id})`);
            resolve();
        });
    });

    // Connect valid client socket
    console.log('\n🔹 Connecting Test Client Socket...');
    const clientSocket = io(SOCKET_URL, {
        auth: { token: clientAuth.token, userType: 'client' },
        transports: ['websocket']
    });

    await new Promise((resolve) => {
        clientSocket.on('connect', () => {
            printPass(`Client socket connected (ID: ${clientSocket.id})`);
            // Join client room
            clientSocket.emit('join_room', clientAuth.user._id);
            resolve();
        });
    });

    // 5.2 Real-time New Job Alert Socket Emission
    console.log('\n🔹 Test 5.2: Partner Receives "new_job_assigned" Socket Event');
    let createdJobId = null;

    const newJobPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout waiting for new_job_assigned event')), 5000);

        partnerSocket.once('new_job_assigned', (data) => {
            clearTimeout(timeout);
            printPass(`Received socket event "new_job_assigned"! Service: ${data.serviceName}, Job ID: ${data.id}`);
            resolve(data);
        });
    });

    // Create request via HTTP API
    const reqRes = await apiRequest('/requests', 'POST', {
        serviceId: config.serviceCategory.id,
        partnerId: config.partnerCredentials.id,
        bookingType: 'instant',
        notes: 'Real-time socket verification test request',
        address: { full: 'Test Address', city: 'Noida', pincode: '201301' }
    }, clientAuth.token);

    createdJobId = reqRes.data?.data?._id || reqRes.data?.data?.id;

    try {
        await newJobPromise;
    } catch (err) {
        printFail('Partner socket did not receive new_job_assigned event', err.message);
    }

    // 5.3 Partner Location Update Broadcast to Client Room
    console.log('\n🔹 Test 5.3: Partner Location Update Broadcast ("partner_location_updated")');
    // First accept job so it's active
    await apiRequest(`/jobs/${createdJobId}/status`, 'PUT', { status: 'accepted' }, partnerAuth.token);

    const locationPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout waiting for partner_location_updated event')), 5000);

        clientSocket.once('partner_location_updated', (locData) => {
            clearTimeout(timeout);
            printPass(`Client received live location broadcast! Lat: ${locData.latitude}, Lng: ${locData.longitude}`);
            resolve(locData);
        });
    });

    // Partner emits live location update via socket
    partnerSocket.emit('update_location', { latitude: 28.6280, longitude: 77.3730 });

    try {
        await locationPromise;
    } catch (err) {
        printFail('Client socket did not receive partner_location_updated event', err.message);
    }

    // 5.4 Real-time Client Cancel Event to Partner Socket
    console.log('\n🔹 Test 5.4: Partner Receives "job_cancelled_by_client" Socket Event');
    const cancelPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout waiting for job_cancelled_by_client event')), 5000);

        partnerSocket.once('job_cancelled_by_client', (cancelData) => {
            clearTimeout(timeout);
            printPass(`Partner socket received "job_cancelled_by_client"! Job ID: ${cancelData.jobId}`);
            resolve(cancelData);
        });
    });

    // Client cancels request via HTTP API
    await apiRequest(`/requests/${createdJobId}/cancel`, 'PUT', {}, clientAuth.token);

    try {
        await cancelPromise;
    } catch (err) {
        printFail('Partner socket did not receive job_cancelled_by_client event', err.message);
    }

    // Disconnect sockets cleanly
    partnerSocket.disconnect();
    clientSocket.disconnect();

    console.log('\n🎉 PHASE 5 REAL-TIME SOCKET TESTS COMPLETE!\n');
}

runPhase5();
