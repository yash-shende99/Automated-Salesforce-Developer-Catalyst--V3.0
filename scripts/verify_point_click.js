const { directCheckChallenge } = require('./direct_api_verifier');

async function main() {
    console.log('=== Verifying Module: Formulas and Validations (point_click_business_logic) ===\n');

    const units = [
        'formula_fields',
        'roll_up_summary_fields',
        'validation_rules'
    ];

    for (const u of units) {
        console.log(`\nChecking unit: ${u}...`);
        const res = await directCheckChallenge(u, 'point_click_business_logic', true);
        console.log(`Result for ${u}:`, res.success ? 'PASSED (+500 pts)' : res.message || res.status);
        await new Promise(r => setTimeout(r, 6000));
    }

    console.log('\n=== Formulas and Validations Complete! ===');
}

main().catch(console.error);
