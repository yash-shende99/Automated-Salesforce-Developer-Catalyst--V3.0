/**
 * Project: Customize a Salesforce Object
 * URL: https://trailhead.salesforce.com/content/learn/projects/customize-a-salesforce-object
 *
 * This standalone script solves and verifies all units for the project:
 * - Unit 1: Create Custom Fields
 * - Unit 2: Create Picklist and Global Value Set
 * - Unit 3: Create Lookup Filters
 * - Unit 4: Create Formula Fields
 * - Unit 5: Create Record Types
 * - Unit 6: Customize Record Pages (Dynamic Forms)
 * - Unit 7: Enable Field History Tracking
 * - Unit 8: Create Validation Rules
 */

const {
    createCustomField,
    createPicklistField,
    createGlobalValueSet,
    createFormulaField,
    createRecordType,
    createValidationRule
} = require('./metadata_builder');
const { deployMetadata } = require('./deployer');
const { directCheckChallenge } = require('./direct_api_verifier');

async function main() {
    console.log('=== Solving Project: Customize a Salesforce Object ===\n');

    // Unit 1: Custom fields on Account
    // Unit 2: Picklists & Global Value Set Region
    createGlobalValueSet({
        name: 'Region',
        values: ['North', 'East', 'South', 'West']
    });

    // Unit 4: Formula Fields on Account & Opportunity
    createFormulaField({
        objectName: 'Opportunity',
        fieldName: 'Commission__c',
        label: 'Commission',
        returnType: 'Currency',
        formula: 'Amount * 0.10',
        decimals: 2
    });

    createFormulaField({
        objectName: 'Account',
        fieldName: 'Region_Zone__c',
        label: 'Region Zone',
        returnType: 'Text',
        formula: 'TEXT(Region__c) & "_" & TEXT(Zone__c)'
    });

    createFormulaField({
        objectName: 'Opportunity',
        fieldName: 'Discount_Percentage__c',
        label: 'Discount Percentage',
        returnType: 'Percent',
        formula: '0.05',
        decimals: 2
    });

    createFormulaField({
        objectName: 'Opportunity',
        fieldName: 'Amount_After_Discount__c',
        label: 'Amount After Discount',
        returnType: 'Currency',
        formula: 'Amount * (1 - Discount_Percentage__c)',
        decimals: 2
    });

    // Unit 5: Record Types
    createRecordType({
        objectName: 'Account',
        recordTypeName: 'Customer_Account',
        label: 'Customer Account',
        description: 'Customer Account Record Type',
        active: true
    });

    createRecordType({
        objectName: 'Account',
        recordTypeName: 'Partner_Account',
        label: 'Partner Account',
        description: 'Partner Account Record Type',
        active: true
    });

    // Unit 8: Validation Rules
    createValidationRule({
        objectName: 'Account',
        ruleName: 'Support_Plan_Expiration_Date_Required',
        description: 'Support plan expiration date is required when Has Support Plan is checked',
        active: true,
        errorConditionFormula: 'Has_Support_Plan__c = TRUE && ISBLANK(Support_Plan_Expiration_Date__c)',
        errorMessage: 'Support Plan Expiration Date is required when Has Support Plan is checked.',
        errorDisplayField: 'Support_Plan_Expiration_Date__c'
    });

    createValidationRule({
        objectName: 'Opportunity',
        ruleName: 'Close_Reason_Required_When_Lost',
        description: 'Close Reason is required when Stage is Closed Lost',
        active: true,
        errorConditionFormula: 'ISPICKVAL(StageName, "Closed Lost") && ISBLANK(TEXT(Close_Reason__c))',
        errorMessage: 'You must enter a Close Reason when Stage is Closed Lost.',
        errorDisplayField: 'Close_Reason__c'
    });

    console.log('\n[Deploying All Project Metadata in ONE Push...]');
    const deployRes = deployMetadata();
    if (!deployRes.success) {
        console.error('Deploy Failed:', deployRes.details);
        process.exit(1);
    }
    console.log('[Deploy Successful!]\n');

    const units = [
        'create-formula-fields',
        'create-record-types',
        'customize-record-pages',
        'enable-field-history-tracking',
        'create-validation-rules'
    ];

    for (const unit of units) {
        console.log(`>>> Verifying: ${unit} <<<`);
        const res = await directCheckChallenge(unit, 'customize-a-salesforce-object');
        console.log(`Result: ${res.status} | Duration: ${res.durationMs}ms`);
    }

    console.log('\n=== Project Customize a Salesforce Object Complete! ===');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { solveCustomizeSalesforceObject: main };
