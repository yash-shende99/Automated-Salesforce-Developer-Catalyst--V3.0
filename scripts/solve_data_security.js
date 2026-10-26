/**
 * Solution runner for Module 21: Data Security (data_security)
 * Unit 1: Overview of Data Security (Quiz - 100 pts)
 * Unit 2: Control Access to the Org (500 pts)
 * Unit 3: Control Access to Objects (500 pts)
 * Unit 4: Control Access to Fields (500 pts)
 * Unit 5: Control Access to Records (500 pts)
 * Unit 6: Create a Role Hierarchy (500 pts)
 * Unit 7: Define Sharing Rules (500 pts)
 */
const { execSync } = require('child_process');
const { directCheckChallenge } = require('./direct_api_verifier');

async function main() {
    console.log('=== SOLVING MODULE 21: Data Security (data_security) ===\n');

    console.log('1. Pre-staging metadata and setup data...');
    // User for Unit 2
    execSync('sf apex run -f scripts/apex/create_testuser.apex -o trailhead', { stdio: 'inherit' });
    // Roles for Unit 6
    execSync('sf apex run -f scripts/apex/setup_roles.apex -o trailhead', { stdio: 'inherit' });
    // FLS for Unit 7
    execSync('sf apex run -f scripts/apex/grant_program_fls.apex -o trailhead', { stdio: 'inherit' });

    console.log('\n2. Verifying all units via API verifier...');

    const units = [
        { name: 'Unit 4: Control Access to Fields', url: 'https://trailhead.salesforce.com/content/learn/modules/data_security/data_security_fields' },
        { name: 'Unit 5: Control Access to Records', url: 'https://trailhead.salesforce.com/content/learn/modules/data_security/data_security_records' },
        { name: 'Unit 6: Create a Role Hierarchy', url: 'https://trailhead.salesforce.com/content/learn/modules/data_security/data_security_roles' },
        { name: 'Unit 7: Define Sharing Rules', url: 'https://trailhead.salesforce.com/content/learn/modules/data_security/data_security_sharing_rules' }
    ];

    for (const u of units) {
        console.log(`\nVerifying ${u.name}...`);
        try {
            const res = await directCheckChallenge(u.url);
            console.log(`Result for ${u.name}:`, res.success ? 'PASSED (+500 pts)' : res.message || res.error);
        } catch (e) {
            console.error(`Verification error for ${u.name}:`, e.message);
        }
    }

    console.log('\n=== DATA SECURITY RUNNER COMPLETE ===');
}

main().catch(console.error);
