const {
    createCustomField,
    createFormulaField,
    createRollUpSummaryField,
    createCustomObject,
    createCustomTab,
    createValidationRule
} = require('./metadata_builder');
const { deployMetadata } = require('./deployer');
const { directCheckChallenge } = require('./direct_api_verifier');

async function main() {
    console.log('=== Solving Project: Improve Data Quality for a Recruiting App ===\n');

    // ==========================================
    // UNIT 1: Create Cross-Object Formulas
    // ==========================================
    console.log('--- [Unit 1] Staging Candidate_Name__c & Position_Title__c on Review__c ---');
    createFormulaField({
        objectName: 'Review__c',
        fieldName: 'Candidate_Name__c',
        label: 'Candidate Name',
        returnType: 'Text',
        formula: 'Job_Application__r.Candidate__r.First_Name__c &" "& Job_Application__r.Candidate__r.Last_Name__c'
    });

    createFormulaField({
        objectName: 'Review__c',
        fieldName: 'Position_Title__c',
        label: 'Position Title',
        returnType: 'Text',
        formula: 'Job_Application__r.Position__r.Name'
    });

    // ==========================================
    // UNIT 2: Create Validation Rules & Custom Object
    // ==========================================
    console.log('--- [Unit 2] Staging Position & Candidate Validation Rules + Zip_Code__c ---');
    
    // Prerequisites for Position
    createCustomField({
        objectName: 'Position__c',
        fieldName: 'Hiring_Manager__c',
        label: 'Hiring Manager',
        type: 'Lookup',
        referenceTo: 'User'
    });

    // 1. Position Validation Rule
    createValidationRule({
        objectName: 'Position__c',
        ruleName: 'Every_Position_Must_Have_a_Hiring_Mgr',
        description: 'Every position record must have a hiring manager',
        active: true,
        errorConditionFormula: 'ISBLANK (Hiring_Manager__c) && $Profile.Name <> "System Administrator"',
        errorMessage: 'Every Position must have a Hiring Manager.',
        errorDisplayField: 'Hiring_Manager__c'
    });

    // 2. Zip_Code__c Custom Object & Fields
    createCustomObject({
        objectName: 'Zip_Code__c',
        label: 'Zip Code',
        pluralLabel: 'Zip Codes',
        nameFieldLabel: 'Zip Code',
        nameFieldType: 'Text',
        enableReports: true
    });

    createCustomField({
        objectName: 'Zip_Code__c',
        fieldName: 'State__c',
        label: 'State',
        type: 'Text',
        length: 2
    });

    createCustomField({
        objectName: 'Zip_Code__c',
        fieldName: 'City__c',
        label: 'City',
        type: 'Text',
        length: 80
    });

    createCustomTab({
        customObject: 'Zip_Code__c',
        motif: 'Custom67: Map'
    });

    // Prerequisites for Candidate
    createCustomField({
        objectName: 'Candidate__c',
        fieldName: 'Zip_Postal_Code__c',
        label: 'Zip/Postal Code',
        type: 'Text',
        length: 10
    });

    createCustomField({
        objectName: 'Candidate__c',
        fieldName: 'State_Province__c',
        label: 'State/Province',
        type: 'Text',
        length: 2
    });

    // 3. Candidate Validation Rule
    createValidationRule({
        objectName: 'Candidate__c',
        ruleName: 'Zip_Code_Consistent_with_State',
        description: 'Validates candidate Zip/Postal Code by looking up the first five characters of the value in a custom object called Zip_Code__c. Error if the zip code is not found or the candidate State does not match the corresponding State in the object',
        active: true,
        errorConditionFormula: 'VLOOKUP($ObjectType.Zip_Code__c.Fields.State__c, $ObjectType.Zip_Code__c.Fields.Name, LEFT( Zip_Postal_Code__c ,5) ) <> State_Province__c',
        errorMessage: 'Candidate Zip Code does not exist in specified State',
        errorDisplayField: 'Zip_Postal_Code__c'
    });

    // ==========================================
    // UNIT 3: Formula and Roll-Up Summary Fields
    // ==========================================
    console.log('--- [Unit 3] Staging Review Score Formula & Job Application Roll-ups ---');
    
    // Prerequisites on Review__c
    createCustomField({
        objectName: 'Review__c',
        fieldName: 'Core_Competencies__c',
        label: 'Core Competencies',
        type: 'Picklist',
        values: ['1', '2', '3', '4', '5']
    });

    createCustomField({
        objectName: 'Review__c',
        fieldName: 'Leadership_Skills__c',
        label: 'Leadership Skills',
        type: 'Picklist',
        values: ['1', '2', '3', '4', '5']
    });

    createCustomField({
        objectName: 'Review__c',
        fieldName: 'Experience__c',
        label: 'Experience',
        type: 'Picklist',
        values: ['1', '2', '3', '4', '5']
    });

    createCustomField({
        objectName: 'Review__c',
        fieldName: 'Recommend_for_Hire__c',
        label: 'Recommend for Hire',
        type: 'Checkbox',
        defaultValue: false
    });

    // 1. Overall Review Score on Review__c
    createFormulaField({
        objectName: 'Review__c',
        fieldName: 'Overall_Review_Score__c',
        label: 'Overall Review Score',
        returnType: 'Number',
        formula: '(VALUE(TEXT(Core_Competencies__c)) + VALUE(TEXT(Experience__c)) + VALUE(TEXT(Leadership_Skills__c)) + IF( Recommend_for_Hire__c , 5, 0) ) / 4',
        decimals: 2
    });

    // 2. Number of Reviews Rollup on Job_Application__c
    createRollUpSummaryField({
        objectName: 'Job_Application__c',
        fieldName: 'Number_of_Reviews__c',
        label: 'Number of Reviews',
        summaryForeignKey: 'Review__c.Job_Application__c',
        summaryOperation: 'count'
    });

    // 3. Total Review Score Rollup on Job_Application__c
    createRollUpSummaryField({
        objectName: 'Job_Application__c',
        fieldName: 'Total_Review_Score__c',
        label: 'Total Review Score',
        summaryForeignKey: 'Review__c.Job_Application__c',
        summaryOperation: 'sum',
        summarizedField: 'Review__c.Overall_Review_Score__c',
        precision: 18,
        scale: 2
    });

    // 4. Average Review Score Formula on Job_Application__c
    createFormulaField({
        objectName: 'Job_Application__c',
        fieldName: 'Average_Review_Score__c',
        label: 'Average Review Score',
        returnType: 'Number',
        formula: 'IF(Number_of_Reviews__c <> 0, Total_Review_Score__c / Number_of_Reviews__c, null)',
        decimals: 2
    });

    // 5. Review Indicator Formula on Job_Application__c
    createFormulaField({
        objectName: 'Job_Application__c',
        fieldName: 'Review_Indicator__c',
        label: 'Review Indicator',
        returnType: 'Text',
        formula: 'IF(Average_Review_Score__c >= 3.5,IMAGE("/img/samples/light_green.gif", "Green"),IF(Average_Review_Score__c >= 2.5,IMAGE("/img/samples/light_yellow.gif", "Yellow"),IF(Average_Review_Score__c > 0,IMAGE("/img/samples/light_red.gif", "Red"), "No Reviews")))'
    });

    // ==========================================
    // SINGLE BATCH DEPLOY (Optimization #3)
    // ==========================================
    console.log('\n[Deploying All 3 Units in ONE Single CLI Push...]');
    const deployStartTime = Date.now();
    const deployRes = deployMetadata();
    const deployElapsed = Date.now() - deployStartTime;

    if (!deployRes.success) {
        console.error('Deploy FAILED:', deployRes.details);
        process.exit(1);
    }
    console.log(`[Deploy Succeeded in ${deployElapsed}ms!]\n`);

    // ==========================================
    // BACK-TO-BACK DIRECT API VERIFICATIONS
    // ==========================================
    const unitsToVerify = [
        'create-cross-object-formulas',
        'create-validation-rules',
        'formula-roll-up-summary-fields'
    ];

    for (const unitSlug of unitsToVerify) {
        console.log(`\n>>> Direct Verifying: ${unitSlug} <<<`);
        const result = await directCheckChallenge(unitSlug, 'improve-data-quality-for-a-recruiting-app');
        console.log(`Unit Result: ${result.status} | Duration: ${result.durationMs}ms`);
        if (!result.success) {
            console.error(`Unit ${unitSlug} failed:`, result.message);
        }
        // Small pause between verifications
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log('\n=== Project Execution Complete! ===');
}

main().catch(console.error);
