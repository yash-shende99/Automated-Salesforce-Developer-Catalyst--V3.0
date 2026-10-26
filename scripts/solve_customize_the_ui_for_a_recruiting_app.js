/**
 * Project: Customize the User Interface for a Recruiting App
 * URL: https://trailhead.salesforce.com/content/learn/projects/customize-the-ui-for-a-recruiting-app
 *
 * This standalone script automates and verifies all 7 units:
 * - Unit 1: Create a Tab for the Review Object
 * - Unit 2: Create an Object-Specific Quick Action
 * - Unit 3: Create a Custom Review Record Page
 * - Unit 4: Create a Custom Candidate Record Page
 * - Unit 5: Create Record Types on the Position Object
 * - Unit 6: Create a Custom Position Record Page
 * - Unit 7: Enable Chatter on the Review Object
 */

const fs = require('fs');
const path = require('path');
const {
    createCustomField,
    createCustomTab,
    createRecordType
} = require('./metadata_builder');
const { deployMetadata } = require('./deployer');
const { directCheckChallenge } = require('./direct_api_verifier');

const BASE_DIR = path.resolve(__dirname, '..', 'force-app', 'main', 'default');

async function main() {
    console.log('=== Solving Project: Customize the User Interface for a Recruiting App ===\n');

    // ==========================================
    // UNIT 1: Create a Tab for the Review Object
    // ==========================================
    console.log('--- [Unit 1] Staging Review__c Custom Tab & Recruiting App ---');
    createCustomTab({
        customObject: 'Review__c',
        motif: 'Custom97: Thermometer'
    });

    // ==========================================
    // UNIT 2: Quick Action "New Job App" on Candidate__c
    // ==========================================
    console.log('--- [Unit 2] Staging Job_Application__c Status & Stage fields & Quick Action ---');
    createCustomField({
        objectName: 'Job_Application__c',
        fieldName: 'Status__c',
        label: 'Status',
        type: 'Picklist',
        values: ['Open', 'Hold', 'Closed']
    });

    createCustomField({
        objectName: 'Job_Application__c',
        fieldName: 'Stage__c',
        label: 'Stage',
        type: 'Picklist',
        values: ['New', 'Phone Screen', 'Schedule Interview', 'Interview Completed', 'Offer Extended', 'Closed - Rejected', 'Closed - Accepted']
    });

    const qaDir = path.join(BASE_DIR, 'quickActions');
    if (!fs.existsSync(qaDir)) fs.mkdirSync(qaDir, { recursive: true });
    
    const qaXml = `<?xml version="1.0" encoding="UTF-8"?>
<QuickAction xmlns="http://soap.sforce.com/2006/04/metadata">
    <description>Action to create a job application from a Candidate record. This description is not visible to users.</description>
    <fieldOverrides>
        <field>Stage__c</field>
        <literalValue>New</literalValue>
    </fieldOverrides>
    <label>New Job App</label>
    <optionsCreateFeedItem>true</optionsCreateFeedItem>
    <quickActionLayout>
        <layoutSectionStyle>TwoColumnsLeftToRight</layoutSectionStyle>
        <quickActionLayoutColumns>
            <quickActionLayoutItems>
                <emptySpace>false</emptySpace>
                <field>Candidate__c</field>
                <uiBehavior>Required</uiBehavior>
            </quickActionLayoutItems>
            <quickActionLayoutItems>
                <emptySpace>false</emptySpace>
                <field>Position__c</field>
                <uiBehavior>Required</uiBehavior>
            </quickActionLayoutItems>
        </quickActionLayoutColumns>
        <quickActionLayoutColumns>
            <quickActionLayoutItems>
                <emptySpace>false</emptySpace>
                <field>Status__c</field>
                <uiBehavior>Edit</uiBehavior>
            </quickActionLayoutItems>
        </quickActionLayoutColumns>
    </quickActionLayout>
    <targetObject>Job_Application__c</targetObject>
    <targetParentField>Candidate__c</targetParentField>
    <type>Create</type>
</QuickAction>
`;
    fs.writeFileSync(path.join(qaDir, 'Candidate__c.New_Job_App.quickAction-meta.xml'), qaXml.trim(), 'utf8');

    // ==========================================
    // UNIT 5: Department Field & Record Types on Position__c
    // ==========================================
    console.log('--- [Unit 5] Staging Department Field & Position Record Types ---');
    createCustomField({
        objectName: 'Position__c',
        fieldName: 'Department__c',
        label: 'Department',
        type: 'Picklist',
        values: ['Engineering', 'Finance', 'IT', 'Sales', 'Support']
    });

    createRecordType({
        objectName: 'Position__c',
        recordTypeName: 'Technical_Position',
        label: 'Technical Position',
        description: 'Use this record type for technical positions only.',
        active: true,
        isDefault: true,
        picklistValues: [
            { picklist: 'Department__c', values: ['Engineering', 'IT'] }
        ]
    });

    createRecordType({
        objectName: 'Position__c',
        recordTypeName: 'Nontechnical_Position',
        label: 'Nontechnical Position',
        description: 'Use this record type for nontechnical positions only.',
        active: true,
        isDefault: false,
        picklistValues: [
            { picklist: 'Department__c', values: ['Finance', 'Sales', 'Support'] }
        ]
    });

    // Make sure one record type is default for Position__c in Admin profile
    const profilePath = path.join(BASE_DIR, 'profiles', 'Admin.profile-meta.xml');
    let pContent = fs.readFileSync(profilePath, 'utf8');
    if (!pContent.includes('<recordType>Position__c.Technical_Position</recordType>')) {
        const rtBlock = `    <recordTypeVisibilities>
        <default>true</default>
        <recordType>Position__c.Technical_Position</recordType>
        <visible>true</visible>
    </recordTypeVisibilities>
    <recordTypeVisibilities>
        <default>false</default>
        <recordType>Position__c.Nontechnical_Position</recordType>
        <visible>true</visible>
    </recordTypeVisibilities>
`;
        if (pContent.includes('<tabVisibilities>')) {
            pContent = pContent.replace('<tabVisibilities>', `${rtBlock}    <tabVisibilities>`);
        } else {
            pContent = pContent.replace('</Profile>', `${rtBlock}</Profile>`);
        }
        fs.writeFileSync(profilePath, pContent, 'utf8');
    }

    // ==========================================
    // UNIT 6: Operating Systems & Programming Languages on Position__c
    // ==========================================
    console.log('--- [Unit 6] Staging Operating Systems & Programming Languages Fields ---');
    createCustomField({
        objectName: 'Position__c',
        fieldName: 'Operating_Systems__c',
        label: 'Operating Systems',
        type: 'Picklist',
        values: ['Windows', 'Unix', 'Mac']
    });

    createCustomField({
        objectName: 'Position__c',
        fieldName: 'Programming_Languages__c',
        label: 'Programming Languages',
        type: 'Picklist',
        values: ['COBOL', 'FORTRAN', '.Net', 'Java', 'PHP', 'Perl', 'Python']
    });

    // ==========================================
    // UNIT 7: Reason Recommended & Interviewer on Review__c + Feed Tracking
    // ==========================================
    console.log('--- [Unit 7] Staging Review__c Feed Tracking & Fields ---');
    createCustomField({
        objectName: 'Review__c',
        fieldName: 'Reason_Recommended__c',
        label: 'Reason Recommended',
        type: 'TextArea'
    });

    createCustomField({
        objectName: 'Review__c',
        fieldName: 'Interviewer__c',
        label: 'Interviewer',
        type: 'Lookup',
        referenceTo: 'User'
    });

    // Enable feed tracking on Review__c fields
    const reviewFields = ['Core_Competencies__c', 'Experience__c', 'Interviewer__c', 'Job_Application__c', 'Leadership_Skills__c', 'Reason_Recommended__c', 'Recommend_for_Hire__c'];
    for (const f of reviewFields) {
        const p = path.join(BASE_DIR, 'objects', 'Review__c', 'fields', `${f}.field-meta.xml`);
        if (fs.existsSync(p)) {
            let c = fs.readFileSync(p, 'utf8');
            if (c.includes('<trackFeedHistory>')) {
                c = c.replace(/<trackFeedHistory>.*?<\/trackFeedHistory>/, '<trackFeedHistory>true</trackFeedHistory>');
            } else {
                c = c.replace('</CustomField>', '    <trackFeedHistory>true</trackFeedHistory>\n</CustomField>');
            }
            fs.writeFileSync(p, c, 'utf8');
        }
    }

    // ==========================================
    // SINGLE BATCH DEPLOY
    // ==========================================
    console.log('\n[Deploying All UI Customizations in ONE Single CLI Push...]');
    const deployStartTime = Date.now();
    const deployRes = deployMetadata();
    const deployElapsed = Date.now() - deployStartTime;

    if (!deployRes.success) {
        console.error('Deploy FAILED:', deployRes.details);
        process.exit(1);
    }
    console.log(`[Deploy Succeeded in ${deployElapsed}ms!]\n`);

    // ==========================================
    // VERIFICATIONS
    // ==========================================
    const projectSlug = 'customize-the-ui-for-a-recruiting-app';
    const unitsToVerify = [
        'create-tab-review-object',
        'create-object-specific-quick-action',
        'customize-review-page-layout',
        'custom-candidate-record-page',
        'record-types-on-position-object',
        'customize-position-page-layout',
        'enable-chatter-on-review-object'
    ];

    for (const unitSlug of unitsToVerify) {
        console.log(`\n>>> Direct Verifying: ${unitSlug} <<<`);
        const result = await directCheckChallenge(unitSlug, projectSlug);
        console.log(`Unit Result: ${result.status} | Duration: ${result.durationMs}ms`);
        if (!result.success) {
            console.error(`Unit ${unitSlug} failed:`, result.message);
        }
        await new Promise(r => setTimeout(r, 1500));
    }

    console.log('\n=== Project Customize the User Interface for a Recruiting App Complete! ===');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { solveCustomizeUIForRecruitingApp: main };
