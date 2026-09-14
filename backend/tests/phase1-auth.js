// backend/tests/phase1-auth.js
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

async function runPhase1() {
    printHeader('PHASE 1: AUTHENTICATION & TOKEN VALIDATION');

    // 1.1 Client Valid Login
    console.log('🔹 Test 1.1: Client Valid Login');
    try {
        const clientAuth = await loginClient();
        printPass(`Logged in as Client: ${clientAuth.user.name} (${clientAuth.user.phone})`);
        printInfo(`Token: ${clientAuth.token.slice(0, 20)}...`);
    } catch (err) {
        printFail('Client login failed', err.message);
    }

    // 1.2 Client Invalid Password
    console.log('\n🔹 Test 1.2: Client Invalid Password');
    const invalidClientRes = await apiRequest('/auth/client/login', 'POST', {
        phone: config.clientCredentials.phone,
        password: 'wrongpassword'
    });
    if (invalidClientRes.status === 401) {
        printPass('Server correctly rejected invalid password with HTTP 401');
    } else {
        printFail(`Expected HTTP 401, got HTTP ${invalidClientRes.status}`);
    }

    // 1.3 Partner Valid Login
    console.log('\n🔹 Test 1.3: Partner Valid Login');
    try {
        const partnerAuth = await loginPartner();
        printPass(`Logged in as Partner: ${partnerAuth.partner.name} (${partnerAuth.partner.phone})`);
        printInfo(`Token: ${partnerAuth.token.slice(0, 20)}...`);
    } catch (err) {
        printFail('Partner login failed', err.message);
    }

    // 1.4 Partner Invalid Password
    console.log('\n🔹 Test 1.4: Partner Invalid Password');
    const invalidPartnerRes = await apiRequest('/auth/partner/login', 'POST', {
        phone: config.partnerCredentials.phone,
        password: 'wrongpassword'
    });
    if (invalidPartnerRes.status === 401) {
        printPass('Server correctly rejected invalid partner password with HTTP 401');
    } else {
        printFail(`Expected HTTP 401, got HTTP ${invalidPartnerRes.status}`);
    }

    // 1.5 Token Refresh Test
    console.log('\n🔹 Test 1.5: Refresh Access Token');
    try {
        const clientAuth = await loginClient();
        const refreshRes = await apiRequest('/auth/refresh', 'POST', {
            refreshToken: clientAuth.refreshToken
        });
        if (refreshRes.ok && refreshRes.data.success && refreshRes.data.data.accessToken) {
            printPass('Successfully issued new access token via refresh token');
        } else {
            printFail('Token refresh failed', refreshRes.data?.message);
        }
    } catch (err) {
        printFail('Token refresh test threw error', err.message);
    }

    // 1.6 Partner Validate Token Endpoint
    console.log('\n🔹 Test 1.6: Validate Partner Token');
    try {
        const partnerAuth = await loginPartner();
        const validateRes = await apiRequest('/auth/partner/validate', 'GET', null, partnerAuth.token);
        if (validateRes.ok && validateRes.data.success) {
            printPass('Partner token validation endpoint returned valid status');
        } else {
            printFail('Partner token validation failed', validateRes.data?.message);
        }
    } catch (err) {
        printFail('Validate token error', err.message);
    }

    // 1.7 Unauthorized Endpoint Access
    console.log('\n🔹 Test 1.7: Reject Request with Invalid Token');
    const unauthRes = await apiRequest('/requests/active', 'GET', null, 'invalid_bearer_token');
    if (unauthRes.status === 401) {
        printPass('Server correctly rejected request with HTTP 401');
    } else {
        printFail(`Expected HTTP 401, got ${unauthRes.status}`);
    }

    printVerify(`Open Client App on phone/simulator.
     Log in with Phone: ${config.clientCredentials.phone} and Password: ${config.clientCredentials.password}.
     Ensure you are on the Home screen.
     Next, open Partner App and log in with Phone: ${config.partnerCredentials.phone} and Password: ${config.partnerCredentials.password}.`);

    await waitForUser();
    console.log('\n✅ Phase 1 Complete!\n');
}

runPhase1();
