// backend/tests/runner-helper.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const configPath = path.join(__dirname, 'test-config.json');
if (!fs.existsSync(configPath)) {
    console.error('❌ test-config.json not found! Run: node backend/src/scripts/seedTestData.js first.');
    process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
};

function printHeader(title) {
    console.log('\n' + colors.bright + colors.cyan + '=====================================================' + colors.reset);
    console.log(colors.bright + colors.cyan + `  ${title}` + colors.reset);
    console.log(colors.bright + colors.cyan + '=====================================================' + colors.reset + '\n');
}

function printPass(msg) {
    console.log(`  ${colors.green}✅ PASS:${colors.reset} ${msg}`);
}

function printFail(msg, error = '') {
    console.log(`  ${colors.red}❌ FAIL:${colors.reset} ${msg} ${error ? '(' + error + ')' : ''}`);
}

function printInfo(msg) {
    console.log(`  ${colors.cyan}ℹ️ INFO:${colors.reset} ${msg}`);
}

function printVerify(instruction) {
    console.log(`\n  ${colors.bright}${colors.yellow}🔍 VERIFY ON APP:${colors.reset}`);
    console.log(`  👉 ${colors.yellow}${instruction}${colors.reset}\n`);
}

function waitForUser(promptText = 'Press ENTER to continue to the next step...') {
    if (process.env.AUTOMATED_TEST === 'true') {
        return Promise.resolve();
    }
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question(`  ${colors.magenta}⏸️  ${promptText}${colors.reset}`, () => {
            rl.close();
            resolve();
        });
    });
}

async function apiRequest(endpoint, method = 'GET', data = null, token = null) {
    const url = `${config.baseUrl}${endpoint}`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers,
    };

    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }

    try {
        const res = await fetch(url, options);
        const json = await res.json();
        return { status: res.status, ok: res.ok, data: json };
    } catch (err) {
        return { status: 500, ok: false, error: err.message };
    }
}

async function loginClient() {
    const res = await apiRequest('/auth/client/login', 'POST', config.clientCredentials);
    if (res.ok && res.data.success) {
        return {
            token: res.data.data.accessToken,
            refreshToken: res.data.data.refreshToken,
            user: res.data.data
        };
    } else {
        throw new Error(`Client login failed: ${res.data?.message || res.error}`);
    }
}

async function loginPartner() {
    const res = await apiRequest('/auth/partner/login', 'POST', config.partnerCredentials);
    if (res.ok && res.data.success) {
        return {
            token: res.data.data.accessToken,
            refreshToken: res.data.data.refreshToken,
            partner: res.data.data.partner
        };
    } else {
        throw new Error(`Partner login failed: ${res.data?.message || res.error}`);
    }
}

module.exports = {
    config,
    colors,
    printHeader,
    printPass,
    printFail,
    printInfo,
    printVerify,
    waitForUser,
    apiRequest,
    loginClient,
    loginPartner
};
