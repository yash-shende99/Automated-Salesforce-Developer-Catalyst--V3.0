const { createRecordType } = require('./metadata_builder');
const { deployMetadata } = require('./deployer');
const { directCheckChallenge } = require('./direct_api_verifier');

async function main() {
    console.log('--- Solving Unit 5: Create Record Types ---');

    const allIndustries = [
        'Agriculture','Apparel','Banking','Biotechnology','Chemicals','Communications',
        'Construction','Consulting','Education','Electronics','Energy','Engineering',
        'Entertainment','Environmental','Finance','Food & Beverage','Government',
        'Healthcare','Hospitality','Insurance','Machinery','Manufacturing','Media',
        'Not For Profit','Recreation','Retail','Shipping','Technology',
        'Telecommunications','Transportation','Utilities','Other'
    ];

    const customerIndustries = allIndustries.filter(i => i !== 'Consulting' && i !== 'Education');
    const partnerIndustries = ['Consulting', 'Education'];

    const allTypes = [
        'Prospect','Customer - Direct','Customer - Channel',
        'Channel Partner / Reseller','Installation Partner','Technology Partner','Other'
    ];
    const partnerTypes = ['Channel Partner / Reseller', 'Installation Partner', 'Technology Partner', 'Other'];

    // 1. Customer Account
    createRecordType({
        objectName: 'Account',
        recordTypeName: 'Customer_Account',
        label: 'Customer Account',
        description: 'For customers and prospects',
        active: true,
        picklistValues: [
            { picklist: 'Industry', values: customerIndustries },
            { picklist: 'Type', values: allTypes }
        ]
    });

    // 2. Partner Account
    createRecordType({
        objectName: 'Account',
        recordTypeName: 'Partner_Account',
        label: 'Partner Account',
        description: 'For consulting partners',
        active: true,
        picklistValues: [
            { picklist: 'Industry', values: partnerIndustries },
            { picklist: 'Type', values: partnerTypes }
        ]
    });

    console.log('[Deploying Unit 5 Record Types...]');
    const deployRes = deployMetadata();
    console.log('Deploy Result:', deployRes.success ? 'SUCCESS' : 'FAILED');
    if (!deployRes.success) {
        console.error(deployRes.details);
        process.exit(1);
    }

    console.log('[Direct API Verifying Unit 5...]');
    const verifyRes = await directCheckChallenge('create-record-types');
    console.log('Verify Result:', JSON.stringify(verifyRes, null, 2));
}

main().catch(console.error);
