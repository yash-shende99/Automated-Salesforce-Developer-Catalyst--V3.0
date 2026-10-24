const fs = require('fs');
const { execSync } = require('child_process');

const CANDIDATES = [
    'flexipage:appHomeTemplateTwoColumns',
    'flexipage:appHomeTemplateTwoRegions',
    'flexipage:twoRegionsAppHomeTemplate',
    'flexipage:twoRegionAppHomeTemplate',
    'flexipage:twoRegions',
    'flexipage:twoRegion',
    'flexipage:appPageTemplateTwoRegions',
    'flexipage:appPageTemplateTwoColumns',
    'flexipage:twoRegionAppPageTemplate',
    'flexipage:appHomeTwoColumnsTemplate',
    'flexipage:appHomeTwoRegionsTemplate',
    'flexipage:twoColumnsAppHomeTemplate',
    'flexipage:twoColumns',
    'flexipage:columnsTwo',
    'flexipage:twoRegionDesktopMobileTemplate',
    'flexipage:appHomeTwoColumns',
    'flexipage:appHomeTwoRegions'
];

const targetPath = 'force-app/main/default/flexipages/Field_Sales_App.flexipage-meta.xml';

for (const tmpl of CANDIDATES) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<FlexiPage xmlns="http://soap.sforce.com/2006/04/metadata">
    <flexiPageRegions>
        <name>left</name>
        <type>Region</type>
    </flexiPageRegions>
    <flexiPageRegions>
        <name>right</name>
        <type>Region</type>
    </flexiPageRegions>
    <masterLabel>Field Sales App</masterLabel>
    <template>
        <name>${tmpl}</name>
    </template>
    <type>AppPage</type>
</FlexiPage>`;

    fs.writeFileSync(targetPath, xml, 'utf8');
    try {
        const out = execSync(`sf project deploy start --source-dir ${targetPath} --json 2>nul`).toString();
        const res = JSON.parse(out);
        if (res.status === 0) {
            console.log(`FOUND WORKING TEMPLATE: ${tmpl}!`);
            process.exit(0);
        } else {
            const prob = res.result?.details?.componentFailures?.[0]?.problem || '';
            console.log(`Tested ${tmpl}: ${prob}`);
            if (!prob.includes("doesn't exist")) {
                console.log(`FOUND EXISTING TEMPLATE (different error): ${tmpl} -> ${prob}`);
                process.exit(0);
            }
        }
    } catch(err) {
        try {
            const parsed = JSON.parse(err.stdout.toString());
            const prob = parsed.result?.details?.componentFailures?.[0]?.problem || '';
            console.log(`Tested ${tmpl}: ${prob}`);
            if (prob && !prob.includes("doesn't exist")) {
                console.log(`FOUND EXISTING TEMPLATE (different error): ${tmpl} -> ${prob}`);
                process.exit(0);
            }
        } catch(e) {
            console.log(`Error testing ${tmpl}`);
        }
    }
}
