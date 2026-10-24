const { directCheckChallenge } = require('./direct_api_verifier');

const units = [
    'standard-custom-fields',
    'picklists-field-dependencies',
    'create-lookup-filters',
    'create-formula-fields',
    'create-record-types',
    'create-account-page-layouts',
    'account-field-history-tracking',
    'create-validation-rules-1'
];

async function checkUnits() {
    console.log('Auditing units for Customize a Salesforce Object...\n');
    for (const unit of units) {
        console.log(`Checking ${unit}...`);
        try {
            const res = await directCheckChallenge(unit, 'customize-a-salesforce-object', false);
            console.log(`[${unit}] Result:`, res.status, '|', res.message);
        } catch (e) {
            console.log(`[${unit}] Error:`, e.message);
        }
        console.log('Waiting 8 seconds before next check to respect rate limits...\n');
        await new Promise(r => setTimeout(r, 8000));
    }
}

checkUnits().catch(console.error);
