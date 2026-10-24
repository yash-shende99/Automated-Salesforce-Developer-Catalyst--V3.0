const fs = require('fs');
const { execSync } = require('child_process');

const CANDIDATES = ['label', 'customLabel', 'customTitle', 'header', 'cardTitle', 'componentLabel'];
const targetPath = 'force-app/main/default/flexipages/Field_Sales_App.flexipage-meta.xml';

for (const prop of CANDIDATES) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<FlexiPage xmlns="http://soap.sforce.com/2006/04/metadata">
    <flexiPageRegions>
        <itemInstances>
            <componentInstance>
                <componentInstanceProperties>
                    <name>entityName</name>
                    <value>Account</value>
                </componentInstanceProperties>
                <componentInstanceProperties>
                    <name>filterName</name>
                    <value>MyAccounts</value>
                </componentInstanceProperties>
                <componentName>flexipage:filterListCard</componentName>
                <identifier>flexipage_filterListCard</identifier>
            </componentInstance>
        </itemInstances>
        <name>column1</name>
        <type>Region</type>
    </flexiPageRegions>
    <flexiPageRegions>
        <itemInstances>
            <componentInstance>
                <componentInstanceProperties>
                    <name>entityNames</name>
                    <valueList>
                        <valueListItems>
                            <value>Opportunity</value>
                        </valueListItems>
                        <valueListItems>
                            <value>Lead</value>
                        </valueListItems>
                    </valueList>
                </componentInstanceProperties>
                <componentInstanceProperties>
                    <name>${prop}</name>
                    <value>Opportunities &amp; Leads</value>
                </componentInstanceProperties>
                <componentName>flexipage:recentItems</componentName>
                <identifier>flexipage_recentItems</identifier>
            </componentInstance>
        </itemInstances>
        <name>column2</name>
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
            console.log(`FOUND WORKING PROPERTY FOR RECENTITEMS: ${prop}!`);
            process.exit(0);
        } else {
            const prob = res.result?.details?.componentFailures?.[0]?.problem || '';
            console.log(`Tested ${prop}: ${prob}`);
        }
    } catch(err) {
        try {
            const parsed = JSON.parse(err.stdout.toString());
            const prob = parsed.result?.details?.componentFailures?.[0]?.problem || '';
            console.log(`Tested ${prop}: ${prob}`);
        } catch(e) {
            console.log(`Error testing ${prop}`);
        }
    }
}
