const { createValidationRule } = require('./metadata_builder');
const { deployMetadata } = require('./deployer');
const { directCheckChallenge } = require('./direct_api_verifier');

async function main() {
    console.log('--- Solving Unit 8: Create Validation Rules (FINAL UNIT) ---');

    // 1. Account Validation Rule
    createValidationRule({
        objectName: 'Account',
        ruleName: 'Support_Plan_Expiration_Date_Required',
        description: 'Support plan expiration date is required when account is marked as having support plan.',
        active: true,
        errorConditionFormula: 'Has_Support_Plan__c = True && ISBLANK(Support_Plan_Expiration_Date__c)',
        errorMessage: 'You must enter an expiration date when an account has a support plan.',
        errorDisplayField: 'Support_Plan_Expiration_Date__c'
    });

    // 2. Opportunity Validation Rule
    createValidationRule({
        objectName: 'Opportunity',
        ruleName: 'Close_Reason_Required_When_Lost',
        description: 'A close reason is required when opportunity is closed lost.',
        active: true,
        errorConditionFormula: 'ISPICKVAL( StageName ,"Closed Lost") && ISBLANK(Close_Reason__c)',
        errorMessage: 'You must enter a close reason when opportunity is closed lost.',
        errorDisplayField: 'Close_Reason__c'
    });

    console.log('[Deploying Unit 8 Validation Rules...]');
    const dep = deployMetadata();
    console.log('Deploy Result:', dep.success ? 'SUCCESS' : 'FAILED');
    if (!dep.success) {
        console.error(dep.details);
        process.exit(1);
    }

    console.log('[Direct API Verifying Unit 8...]');
    const ver = await directCheckChallenge('create-validation-rules-1');
    console.log('Verify Result:', JSON.stringify(ver, null, 2));
}

main().catch(console.error);
