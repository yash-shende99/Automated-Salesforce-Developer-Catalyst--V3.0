const fs = require('fs');
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..', 'force-app', 'main', 'default');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// 1. Global Picklist: Region
const gvsDir = path.join(BASE_DIR, 'globalValueSets');
ensureDir(gvsDir);

const regionGvsXml = `<?xml version="1.0" encoding="UTF-8"?>
<GlobalValueSet xmlns="http://soap.sforce.com/2006/04/metadata">
    <customValue>
        <fullName>APAC</fullName>
        <default>false</default>
        <label>APAC</label>
    </customValue>
    <customValue>
        <fullName>EMEA</fullName>
        <default>false</default>
        <label>EMEA</label>
    </customValue>
    <customValue>
        <fullName>LATAM</fullName>
        <default>false</default>
        <label>LATAM</label>
    </customValue>
    <customValue>
        <fullName>US</fullName>
        <default>false</default>
        <label>US</label>
    </customValue>
    <customValue>
        <fullName>Canada</fullName>
        <default>false</default>
        <label>Canada</label>
    </customValue>
    <description>For use in region fields throughout AW's org.</description>
    <masterLabel>Region</masterLabel>
    <sorted>false</sorted>
</GlobalValueSet>
`;
fs.writeFileSync(path.join(gvsDir, 'Region.globalValueSet-meta.xml'), regionGvsXml.trim(), 'utf8');
console.log('[Created] Region.globalValueSet-meta.xml');

// 2. Lead.Region__c
const leadFieldDir = path.join(BASE_DIR, 'objects', 'Lead', 'fields');
ensureDir(leadFieldDir);
const leadRegionXml = `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Region__c</fullName>
    <description>Customer's geographical region—for sales operations use only.</description>
    <inlineHelpText>In which region is the customer based?</inlineHelpText>
    <label>Region</label>
    <required>false</required>
    <trackFeedHistory>false</trackFeedHistory>
    <type>Picklist</type>
    <valueSet>
        <restricted>true</restricted>
        <valueSetName>Region</valueSetName>
    </valueSet>
</CustomField>
`;
fs.writeFileSync(path.join(leadFieldDir, 'Region__c.field-meta.xml'), leadRegionXml.trim(), 'utf8');
console.log('[Created] Lead.Region__c.field-meta.xml');

// 3. Account.Region__c
const accountFieldDir = path.join(BASE_DIR, 'objects', 'Account', 'fields');
ensureDir(accountFieldDir);
const accountRegionXml = `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Region__c</fullName>
    <description>Customer's geographical region—for sales operations use only.</description>
    <inlineHelpText>In which region is the customer based?</inlineHelpText>
    <label>Region</label>
    <required>false</required>
    <trackFeedHistory>false</trackFeedHistory>
    <type>Picklist</type>
    <valueSet>
        <restricted>true</restricted>
        <valueSetName>Region</valueSetName>
    </valueSet>
</CustomField>
`;
fs.writeFileSync(path.join(accountFieldDir, 'Region__c.field-meta.xml'), accountRegionXml.trim(), 'utf8');
console.log('[Created] Account.Region__c.field-meta.xml');

// 4. Account.Zone__c with Field Dependency on Region__c
const zones = [
    { name: 'East Asia', region: 'APAC' },
    { name: 'Oceania', region: 'APAC' },
    { name: 'Southeast Asia', region: 'APAC' },
    { name: 'Africa', region: 'EMEA' },
    { name: 'Europe', region: 'EMEA' },
    { name: 'Middle East', region: 'EMEA' },
    { name: 'UK + Ireland', region: 'EMEA' },
    { name: 'Mexico', region: 'LATAM' },
    { name: 'Caribbean', region: 'LATAM' },
    { name: 'Central America', region: 'LATAM' },
    { name: 'South America', region: 'LATAM' },
    { name: 'Midwest US', region: 'US' },
    { name: 'Northeast US', region: 'US' },
    { name: 'Southeast US', region: 'US' },
    { name: 'Southwest US', region: 'US' },
    { name: 'West US', region: 'US' },
    { name: 'Northern Canada', region: 'Canada' },
    { name: 'Mountains and the West', region: 'Canada' }
];

const zoneValuesXml = zones.map(z => `            <value>
                <fullName>${z.name}</fullName>
                <default>false</default>
                <label>${z.name}</label>
            </value>`).join('\n');

const zoneSettingsXml = zones.map(z => `        <valueSettings>
            <controllingFieldValue>${z.region}</controllingFieldValue>
            <valueName>${z.name}</valueName>
        </valueSettings>`).join('\n');

const accountZoneXml = `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Zone__c</fullName>
    <label>Zone</label>
    <required>false</required>
    <trackFeedHistory>false</trackFeedHistory>
    <type>Picklist</type>
    <valueSet>
        <controllingField>Region__c</controllingField>
        <restricted>true</restricted>
        <valueSetDefinition>
            <sorted>false</sorted>
${zoneValuesXml}
        </valueSetDefinition>
${zoneSettingsXml}
    </valueSet>
</CustomField>
`;
fs.writeFileSync(path.join(accountFieldDir, 'Zone__c.field-meta.xml'), accountZoneXml.trim(), 'utf8');
console.log('[Created] Account.Zone__c.field-meta.xml');

// 5. Opportunity.Close_Reason__c with Dependency on StageName
const oppFieldDir = path.join(BASE_DIR, 'objects', 'Opportunity', 'fields');
ensureDir(oppFieldDir);

const closeReasons = [
    { name: 'Won - Competitor', stage: 'Closed Won' },
    { name: 'Won - Price', stage: 'Closed Won' },
    { name: 'Won - Recommendation', stage: 'Closed Won' },
    { name: 'Lost - Competitor', stage: 'Closed Lost' },
    { name: 'Lost - Price', stage: 'Closed Lost' },
    { name: 'Lost - Timing', stage: 'Closed Lost' }
];

const closeReasonValuesXml = closeReasons.map(r => `            <value>
                <fullName>${r.name}</fullName>
                <default>false</default>
                <label>${r.name}</label>
            </value>`).join('\n');

const closeReasonSettingsXml = closeReasons.map(r => `        <valueSettings>
            <controllingFieldValue>${r.stage}</controllingFieldValue>
            <valueName>${r.name}</valueName>
        </valueSettings>`).join('\n');

const oppCloseReasonXml = `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Close_Reason__c</fullName>
    <label>Close Reason</label>
    <required>false</required>
    <trackFeedHistory>false</trackFeedHistory>
    <type>Picklist</type>
    <valueSet>
        <controllingField>StageName</controllingField>
        <restricted>true</restricted>
        <valueSetDefinition>
            <sorted>false</sorted>
${closeReasonValuesXml}
        </valueSetDefinition>
${closeReasonSettingsXml}
    </valueSet>
</CustomField>
`;
fs.writeFileSync(path.join(oppFieldDir, 'Close_Reason__c.field-meta.xml'), oppCloseReasonXml.trim(), 'utf8');
console.log('[Created] Opportunity.Close_Reason__c.field-meta.xml');

console.log('--- All Unit 2 Metadata Generated Successfully! ---');
