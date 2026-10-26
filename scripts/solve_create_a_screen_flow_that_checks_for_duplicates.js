const path = require('path');
const { directCheckChallenge } = require('./direct_api_verifier');

const PROJECT_SLUG = 'build-a-simple-flow';
const UNITS = [
    { slug: 'collect-contact-info-from-your-user', name: 'Unit 1: Collect Contact Info from Your User' },
    { slug: 'check-for-a-matching-contact-in-your-org', name: 'Unit 2: Check for a Matching Contact in Your Org' },
    { slug: 'branch-the-flow', name: 'Unit 3: Branch the Flow' },
    { slug: 'create-or-update-a-contact', name: 'Unit 4: Create or Update a Contact' },
    { slug: 'present-confirmation-screens', name: 'Unit 5: Present Confirmation Screens' }
];

async function solveScreenFlowProject() {
    console.log('================================================================');
    console.log('STARTING: Create a Screen Flow That Checks for Duplicates (Item 12 of 32)');
    console.log('================================================================\n');

    const results = [];
    for (let i = 0; i < UNITS.length; i++) {
        const u = UNITS[i];
        console.log(`\n------------------------------------------------------------`);
        console.log(`[VERIFYING] ${u.name}...`);
        console.log(`------------------------------------------------------------`);

        const res = await directCheckChallenge(u.slug, PROJECT_SLUG);
        console.log(`Result: Success=${res.success}, Duration=${res.durationMs}ms, Msg=${res.message}`);
        results.push({ ...u, ...res });

        if (!res.success) {
            console.error(`FAILED on ${u.name}! Stopping sequential run.`);
            break;
        }
    }

    console.log('\n================================================================');
    console.log('PROJECT 12 SUMMARY:');
    results.forEach(r => console.log(`- ${r.name}: ${r.success ? 'PASSED' : 'FAILED'} (${r.durationMs}ms)`));
    console.log('================================================================');
}

if (require.main === module) {
    solveScreenFlowProject().catch(console.error);
}

module.exports = { solveScreenFlowProject };
