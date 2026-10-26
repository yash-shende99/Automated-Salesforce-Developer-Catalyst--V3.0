const { createCustomField, createFormulaField } = require('./metadata_builder');
const { deployMetadata } = require('./deployer');
const { directCheckChallenge } = require('./direct_api_verifier');

async function main() {
    console.log('--- Solving Unit 4: Create Formula Fields ---');

    // 1. Discount Percentage
    createCustomField({
        objectName: 'Opportunity',
        fieldName: 'Discount_Percentage__c',
        label: 'Discount Percentage',
        type: 'Percent',
        precision: 3,
        scale: 0
    });

    // 2. Commission
    createFormulaField({
        objectName: 'Opportunity',
        fieldName: 'Commission__c',
        label: 'Commission',
        description: 'Calculates sales rep commission of 10 percent when opportunity is won.',
        helpText: 'Sales rep commission when opportunity is won.',
        returnType: 'Currency',
        formula: 'IF( ISPICKVAL( StageName , "Closed Won") , Amount * 0.1, 0)',
        decimals: 2
    });

    // 3. Region/Zone
    createFormulaField({
        objectName: 'Opportunity',
        fieldName: 'Region_Zone__c',
        label: 'Region/Zone',
        description: 'Displays the Region and Zone values from the account record.',
        helpText: 'Account region and zone.',
        returnType: 'Text',
        formula: 'TEXT( Account.Region__c ) & "/" & TEXT( Account.Zone__c )'
    });

    // 4. Amount After Discount
    createFormulaField({
        objectName: 'Opportunity',
        fieldName: 'Amount_After_Discount__c',
        label: 'Amount After Discount',
        description: 'Calculates the opportunity amount after any discount has been applied.',
        helpText: 'Opportunity amount after discount has been applied.',
        returnType: 'Currency',
        formula: 'Amount * ( 1 - Discount_Percentage__c )',
        decimals: 2
    });

    console.log('[Deploying Unit 4 Metadata...]');
    const deployRes = deployMetadata();
    console.log('Deploy Result:', deployRes.success ? 'SUCCESS' : 'FAILED');
    if (!deployRes.success) {
        console.error(deployRes.details);
        process.exit(1);
    }

    console.log('[Direct API Verifying Unit 4...]');
    const verifyRes = await directCheckChallenge('create-formula-fields');
    console.log('Verify Result:', JSON.stringify(verifyRes, null, 2));
}

main().catch(console.error);
