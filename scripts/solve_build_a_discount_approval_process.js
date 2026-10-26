const { directCheckChallenge } = require('./direct_api_verifier');

const UNITS = [
    { name: 'Prepare Your Org', slug: 'prepare-your-org' },
    { name: 'Create an Approval Process', slug: 'create-an-approval-process' },
    { name: 'Create Initial Submission Actions', slug: 'create-initial-submission-actions' },
    { name: 'Specify Final Approval and Rejection Actions', slug: 'specify-final-approval-and-rejection-actions' }
];

const PROJECT_SLUG = 'build-a-discount-approval-process';

async function main() {
    console.log(`=== SOLVING PROJECT: ${PROJECT_SLUG} ===\n`);
    for (const unit of UNITS) {
        console.log(`Verifying Unit: ${unit.name} (${unit.slug})...`);
        const result = await directCheckChallenge(unit.slug, PROJECT_SLUG);
        console.log(`Result:`, JSON.stringify(result, null, 2));
        if (!result.success) {
            console.error(`FAILED on ${unit.slug}: ${result.error || result.message}`);
            process.exit(1);
        }
        console.log(`PASSED: ${unit.name} (+${result.points || 100} pts)\n`);
        console.log('Waiting 6s to avoid Trailhead rate limits...');
        await new Promise(r => setTimeout(r, 6000));
    }
    console.log(`=== ALL UNITS IN ${PROJECT_SLUG} COMPLETED SUCCESSFULLY! ===`);
}

main().catch(err => {
    console.error('Fatal error in solve script:', err);
    process.exit(1);
});
