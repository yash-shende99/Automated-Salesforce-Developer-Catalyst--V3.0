const fs = require('fs');
const { execSync } = require('child_process');

const REGION_CANDIDATES = [
    ['leftColumn', 'rightColumn'],
    ['column1', 'column2'],
    ['region1', 'region2'],
    ['main', 'sidebar'],
    ['primary', 'secondary'],
    ['columnOne', 'columnTwo'],
    ['col1', 'col2'],
    ['first', 'second']
];

const targetPath = 'force-app/main/default/flexipages/Field_Sales_App.flexipage-meta.xml';

for (const [r1, r2] of REGION_CANDIDATES) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<FlexiPage xmlns="http://soap.sforce.com/2006/04/metadata">
    <flexiPageRegions>
        <name>${r1}</name>
        <type>Region</type>
    </flexiPageRegions>
    <flexiPageRegions>
        <name>${r2}</name>
        <type>Region</type>
    </flexiPageRegions>
    <masterLabel>Field Sales App</masterLabel>
    <template>
        <name>flexipage:appHomeTemplateTwoColumns</name>
    </template>
    <type>AppPage</type>
</FlexiPage>`;

    fs.writeFileSync(targetPath, xml, 'utf8');
    try {
        const out = execSync(`sf project deploy start --source-dir ${targetPath} --json 2>nul`).toString();
        const res = JSON.parse(out);
        if (res.status === 0) {
            console.log(`FOUND WORKING REGIONS: ${r1}, ${r2}!`);
            process.exit(0);
        } else {
            const prob = res.result?.details?.componentFailures?.[0]?.problem || '';
            console.log(`Tested ${r1}, ${r2}: ${prob}`);
        }
    } catch(err) {
        try {
            const parsed = JSON.parse(err.stdout.toString());
            const prob = parsed.result?.details?.componentFailures?.[0]?.problem || '';
            console.log(`Tested ${r1}, ${r2}: ${prob}`);
        } catch(e) {
            console.log(`Error testing ${r1}, ${r2}`);
        }
    }
}
