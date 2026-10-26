/**
 * Solution runner for Project 22: Keep Data Secure in a Recruiting App (keep-data-secure-in-a-recruiting-app)
 * Step 1: create-custom-profiles (100 pts)
 * Step 2: fls-perm-sets-sharing (100 pts)
 */
const { execSync } = require('child_process');
const { directCheckChallenge } = require('./direct_api_verifier');

async function main() {
    console.log('=== SOLVING PROJECT 22: Keep Data Secure in a Recruiting App ===\n');

    console.log('1. Deploying metadata (HR Recruiter profile, Hiring_Manager permission set, tabs, OWDs)...');
    execSync('sf project deploy start -d force-app/main/default/tabs/Interviewer__c.tab-meta.xml -d force-app/main/default/tabs/Job_Posting_Site__c.tab-meta.xml -d "force-app/main/default/profiles/HR Recruiter.profile-meta.xml" -d force-app/main/default/permissionsets/Hiring_Manager.permissionset-meta.xml -d force-app/main/default/objects/Candidate__c/Candidate__c.object-meta.xml -d force-app/main/default/objects/Position__c/Position__c.object-meta.xml -d force-app/main/default/objects/Job_Application__c/Job_Application__c.object-meta.xml -o trailhead', { stdio: 'inherit' });

    console.log('\n2. Verifying steps via Direct API Verifier...');
    const steps = [
        'create-custom-profiles',
        'fls-perm-sets-sharing'
    ];

    for (const step of steps) {
        console.log(`\nVerifying step: ${step}...`);
        const res = await directCheckChallenge(step, 'keep-data-secure-in-a-recruiting-app');
        console.log(`Result for ${step}:`, res.success ? 'PASSED (+100 pts)' : res.message || res.error);
    }

    console.log('\n=== PROJECT 22 COMPLETE ===');
}

main().catch(console.error);
