// backend/tests/run-all-tests.js
const { execSync } = require('child_process');
const readline = require('readline');
const path = require('path');

const phases = [
    { name: 'Phase 1: Auth & Token Validation', file: 'phase1-auth.js' },
    { name: 'Phase 2: Happy Path Full Lifecycle (Interactive)', file: 'phase2-happy-path.js' },
    { name: 'Phase 3: Cancellation & Rejection Flows (Interactive)', file: 'phase3-cancellation.js' },
    { name: 'Phase 4: State Machine & Edge Cases', file: 'phase4-state-machine.js' },
    { name: 'Phase 5: Real-Time Socket.IO Integration', file: 'phase5-sockets.js' },
    { name: 'Phase 6: Reviews, Wallet & Profile Features', file: 'phase6-features.js' },
];

console.log('\n=====================================================');
console.log('  🧪 LOCAL PCO PLATFORM - E2E TEST SUITE RUNNER  ');
console.log('=====================================================\n');

console.log('Choose an option:');
console.log('  [0] Run ALL Phases (1 through 6)');
phases.forEach((p, idx) => {
    console.log(`  [${idx + 1}] Run ${p.name}`);
});
console.log('');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('Select choice [0-6]: ', (answer) => {
    rl.close();
    const choice = parseInt(answer.trim(), 10);

    if (isNaN(choice) || choice < 0 || choice > phases.length) {
        console.error('Invalid choice. Exiting.');
        process.exit(1);
    }

    const testsToRun = choice === 0 ? phases : [phases[choice - 1]];

    for (const test of testsToRun) {
        console.log(`\n🚀 Launching ${test.name}...`);
        const filePath = path.join(__dirname, test.file);
        try {
            execSync(`node "${filePath}"`, { stdio: 'inherit' });
        } catch (err) {
            console.error(`❌ ${test.name} failed with exit code ${err.status}`);
            if (choice === 0) {
                console.log('Stopping test suite due to failure.');
                break;
            }
        }
    }
});
