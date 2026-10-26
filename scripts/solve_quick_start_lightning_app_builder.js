const { directCheckChallenge } = require('./direct_api_verifier');

const UNITS = [
    { name: 'Create Your First Page', slug: 'quickstart-app-builder1' },
    { name: 'Add More Components', slug: 'quickstart-app-builder2' },
    { name: 'Add Quick Actions and Activate the App', slug: 'quickstart-app-builder3' }
];

const PROJECT_SLUG = 'quickstart-app-builder';

async function main() {
    console.log(`=== SOLVING PROJECT: ${PROJECT_SLUG} (Quick Start: Lightning App Builder) ===\n`);
    for (const unit of UNITS) {
        console.log(`Verifying Unit: ${unit.name} (${unit.slug})...`);
        const result = await directCheckChallenge(unit.slug, PROJECT_SLUG);
        console.log(`Result:`, JSON.stringify(result, null, 2));
        if (!result.success) {
            console.error(`FAILED on ${unit.slug}: ${result.error || result.message}`);
            process.exit(1);
        }
        console.log(`PASSED: ${unit.name} (+${result.points || 100} pts)\n`);
    }
    console.log(`=== ALL UNITS IN ${PROJECT_SLUG} COMPLETED SUCCESSFULLY! ===`);
}

main().catch(err => {
    console.error('Fatal error in solve script:', err);
    process.exit(1);
});
