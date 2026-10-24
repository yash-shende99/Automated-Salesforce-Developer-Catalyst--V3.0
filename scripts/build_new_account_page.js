const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '..', 'force-app', 'main', 'default', 'flexipages', 'New_Account_Page.flexipage-meta.xml');

let facetIndex = 1;
function getFacet(name) {
    return `${name}_${facetIndex++}`;
}

function makeField(apiName, required = false) {
    return `        <itemInstances>
            <fieldInstance>
                <fieldInstanceProperties>
                    <name>uiBehavior</name>
                    <value>${required ? 'required' : 'none'}</value>
                </fieldInstanceProperties>
                <fieldItem>Record.${apiName}</fieldItem>
                <identifier>Record_${apiName.replace(/[^a-zA-Z0-9]/g, '_')}_${facetIndex++}</identifier>
            </fieldInstance>
        </itemInstances>\n`;
}

function makeTwoColSection(label, col1Fields, col2Fields) {
    const col1Facet = getFacet('Col1');
    const col2Facet = getFacet('Col2');
    const colsFacet = getFacet('Cols');

    let col1Xml = `    <flexiPageRegions>\n`;
    for (const f of col1Fields) {
        col1Xml += makeField(f.name, f.required);
    }
    col1Xml += `        <name>${col1Facet}</name>\n        <type>Facet</type>\n    </flexiPageRegions>\n`;

    let col2Xml = `    <flexiPageRegions>\n`;
    for (const f of col2Fields) {
        col2Xml += makeField(f.name, f.required);
    }
    col2Xml += `        <name>${col2Facet}</name>\n        <type>Facet</type>\n    </flexiPageRegions>\n`;

    const colsXml = `    <flexiPageRegions>
        <itemInstances>
            <componentInstance>
                <componentInstanceProperties>
                    <name>body</name>
                    <value>${col1Facet}</value>
                </componentInstanceProperties>
                <componentName>flexipage:column</componentName>
                <identifier>col_${col1Facet}</identifier>
            </componentInstance>
        </itemInstances>
        <itemInstances>
            <componentInstance>
                <componentInstanceProperties>
                    <name>body</name>
                    <value>${col2Facet}</value>
                </componentInstanceProperties>
                <componentName>flexipage:column</componentName>
                <identifier>col_${col2Facet}</identifier>
            </componentInstance>
        </itemInstances>
        <name>${colsFacet}</name>
        <type>Facet</type>
    </flexiPageRegions>\n`;

    const sectionComponentInstance = `        <itemInstances>
            <componentInstance>
                <componentInstanceProperties>
                    <name>columns</name>
                    <value>${colsFacet}</value>
                </componentInstanceProperties>
                <componentInstanceProperties>
                    <name>horizontalAlignment</name>
                    <value>false</value>
                </componentInstanceProperties>
                <componentInstanceProperties>
                    <name>label</name>
                    <value>${label}</value>
                </componentInstanceProperties>
                <componentName>flexipage:fieldSection</componentName>
                <identifier>sec_${colsFacet}</identifier>
            </componentInstance>
        </itemInstances>\n`;

    return {
        facetsXml: col1Xml + col2Xml + colsXml,
        sectionComponentInstance
    };
}

function makeOneColSection(label, fields) {
    const colFacet = getFacet('ColSingle');
    const colsFacet = getFacet('ColsSingle');

    let colXml = `    <flexiPageRegions>\n`;
    for (const f of fields) {
        colXml += makeField(f.name, f.required);
    }
    colXml += `        <name>${colFacet}</name>\n        <type>Facet</type>\n    </flexiPageRegions>\n`;

    const colsXml = `    <flexiPageRegions>
        <itemInstances>
            <componentInstance>
                <componentInstanceProperties>
                    <name>body</name>
                    <value>${colFacet}</value>
                </componentInstanceProperties>
                <componentName>flexipage:column</componentName>
                <identifier>col_${colFacet}</identifier>
            </componentInstance>
        </itemInstances>
        <name>${colsFacet}</name>
        <type>Facet</type>
    </flexiPageRegions>\n`;

    const sectionComponentInstance = `        <itemInstances>
            <componentInstance>
                <componentInstanceProperties>
                    <name>columns</name>
                    <value>${colsFacet}</value>
                </componentInstanceProperties>
                <componentInstanceProperties>
                    <name>horizontalAlignment</name>
                    <value>false</value>
                </componentInstanceProperties>
                <componentInstanceProperties>
                    <name>label</name>
                    <value>${label}</value>
                </componentInstanceProperties>
                <componentName>flexipage:fieldSection</componentName>
                <identifier>sec_${colsFacet}</identifier>
            </componentInstance>
        </itemInstances>\n`;

    return {
        facetsXml: colXml + colsXml,
        sectionComponentInstance
    };
}

// 1. Account Information (Fax removed)
const accInfo = makeTwoColSection('Account Information', [
    { name: 'OwnerId' },
    { name: 'Name', required: true },
    { name: 'ParentId' },
    { name: 'AccountNumber' },
    { name: 'Site' },
    { name: 'Type' },
    { name: 'Industry' },
    { name: 'AnnualRevenue' }
], [
    { name: 'Rating' },
    { name: 'Phone' },
    { name: 'Website' },
    { name: 'TickerSymbol' },
    { name: 'Ownership' },
    { name: 'NumberOfEmployees' },
    { name: 'Sic' }
]);

// 2. Address Information
const addrInfo = makeTwoColSection('Address Information', [
    { name: 'BillingAddress' }
], [
    { name: 'ShippingAddress' }
]);

// 3. Additional Information (SLAExpirationDate__c removed)
const addlInfo = makeTwoColSection('Additional Information', [
    { name: 'CustomerPriority__c' },
    { name: 'NumberofLocations__c' },
    { name: 'Active__c' }
], [
    { name: 'SLA__c' },
    { name: 'SLASerialNumber__c' },
    { name: 'UpsellOpportunity__c' }
]);

// 4. System Information
const sysInfo = makeTwoColSection('System Information', [
    { name: 'CreatedById' }
], [
    { name: 'LastModifiedById' }
]);

// 5. Description Information
const descInfo = makeOneColSection('Description Information', [
    { name: 'Description' }
]);

// Build Detail Tab Facet (Account Information + Address Information)
const detailTabFacet = `    <flexiPageRegions>
${accInfo.sectionComponentInstance}${addrInfo.sectionComponentInstance}        <name>detailTabContent</name>
        <type>Facet</type>
    </flexiPageRegions>\n`;

// Build More Information Tab Facet (Additional Info + System Info + Description Info)
const moreInfoTabFacet = `    <flexiPageRegions>
${addlInfo.sectionComponentInstance}${sysInfo.sectionComponentInstance}${descInfo.sectionComponentInstance}        <name>moreInfoTabContent</name>
        <type>Facet</type>
    </flexiPageRegions>\n`;

// Standard Activity & Related List Facets
const activityFacet = `    <flexiPageRegions>
        <itemInstances>
            <componentInstance>
                <componentName>runtime_sales_activities:activityPanel</componentName>
                <identifier>runtime_sales_activities_activityPanel</identifier>
            </componentInstance>
        </itemInstances>
        <name>activityTabContent</name>
        <type>Facet</type>
    </flexiPageRegions>\n`;

const relatedFacet = `    <flexiPageRegions>
        <itemInstances>
            <componentInstance>
                <componentName>force:relatedListContainer</componentName>
                <identifier>force_relatedListContainer</identifier>
            </componentInstance>
        </itemInstances>
        <name>relatedTabContent</name>
        <type>Facet</type>
    </flexiPageRegions>\n`;

// Main Tabs Facet
const mainTabsFacet = `    <flexiPageRegions>
        <itemInstances>
            <componentInstance>
                <componentInstanceProperties>
                    <name>active</name>
                    <value>true</value>
                </componentInstanceProperties>
                <componentInstanceProperties>
                    <name>body</name>
                    <value>detailTabContent</value>
                </componentInstanceProperties>
                <componentInstanceProperties>
                    <name>title</name>
                    <value>Standard.Tab.detail</value>
                </componentInstanceProperties>
                <componentName>flexipage:tab</componentName>
                <identifier>detailTab</identifier>
            </componentInstance>
        </itemInstances>
        <itemInstances>
            <componentInstance>
                <componentInstanceProperties>
                    <name>body</name>
                    <value>moreInfoTabContent</value>
                </componentInstanceProperties>
                <componentInstanceProperties>
                    <name>title</name>
                    <value>More Information</value>
                </componentInstanceProperties>
                <componentName>flexipage:tab</componentName>
                <identifier>moreInfoTab</identifier>
            </componentInstance>
        </itemInstances>
        <itemInstances>
            <componentInstance>
                <componentInstanceProperties>
                    <name>body</name>
                    <value>activityTabContent</value>
                </componentInstanceProperties>
                <componentInstanceProperties>
                    <name>title</name>
                    <value>Standard.Tab.activity</value>
                </componentInstanceProperties>
                <componentName>flexipage:tab</componentName>
                <identifier>activityTab</identifier>
            </componentInstance>
        </itemInstances>
        <itemInstances>
            <componentInstance>
                <componentInstanceProperties>
                    <name>body</name>
                    <value>relatedTabContent</value>
                </componentInstanceProperties>
                <componentInstanceProperties>
                    <name>title</name>
                    <value>Standard.Tab.relatedLists</value>
                </componentInstanceProperties>
                <componentName>flexipage:tab</componentName>
                <identifier>relatedListsTab</identifier>
            </componentInstance>
        </itemInstances>
        <name>maintabs</name>
        <type>Facet</type>
    </flexiPageRegions>\n`;

// Dynamic Highlights Panel Header Facets
const dynHighlightsHeaderFacets = `    <flexiPageRegions>
        <itemInstances>
            <fieldInstance>
                <fieldInstanceProperties>
                    <name>uiBehavior</name>
                    <value>none</value>
                </fieldInstanceProperties>
                <fieldItem>Record.Name</fieldItem>
                <identifier>RecordNamePrimaryField</identifier>
            </fieldInstance>
        </itemInstances>
        <name>Facet-PrimaryFields</name>
        <type>Facet</type>
    </flexiPageRegions>
    <flexiPageRegions>
        <itemInstances>
            <fieldInstance>
                <fieldInstanceProperties>
                    <name>uiBehavior</name>
                    <value>none</value>
                </fieldInstanceProperties>
                <fieldItem>Record.Type</fieldItem>
                <identifier>Record_Type_Secondary</identifier>
            </fieldInstance>
        </itemInstances>
        <itemInstances>
            <fieldInstance>
                <fieldInstanceProperties>
                    <name>uiBehavior</name>
                    <value>none</value>
                </fieldInstanceProperties>
                <fieldItem>Record.Industry</fieldItem>
                <identifier>Record_Industry_Secondary</identifier>
            </fieldInstance>
        </itemInstances>
        <itemInstances>
            <fieldInstance>
                <fieldInstanceProperties>
                    <name>uiBehavior</name>
                    <value>none</value>
                </fieldInstanceProperties>
                <fieldItem>Record.Phone</fieldItem>
                <identifier>Record_Phone_Secondary</identifier>
            </fieldInstance>
        </itemInstances>
        <itemInstances>
            <fieldInstance>
                <fieldInstanceProperties>
                    <name>uiBehavior</name>
                    <value>none</value>
                </fieldInstanceProperties>
                <fieldItem>Record.Rating</fieldItem>
                <identifier>Record_Rating_Secondary</identifier>
            </fieldInstance>
        </itemInstances>
        <itemInstances>
            <fieldInstance>
                <fieldInstanceProperties>
                    <name>uiBehavior</name>
                    <value>none</value>
                </fieldInstanceProperties>
                <fieldItem>Record.OwnerId</fieldItem>
                <identifier>Record_OwnerId_Secondary</identifier>
            </fieldInstance>
        </itemInstances>
        <name>Facet-SecondaryFields</name>
        <type>Facet</type>
    </flexiPageRegions>
    <flexiPageRegions>
        <itemInstances>
            <componentInstance>
                <componentInstanceProperties>
                    <name>actionNames</name>
                    <valueList>
                        <valueListItems>
                            <value>Edit</value>
                        </valueListItems>
                        <valueListItems>
                            <value>Global.NewCase</value>
                        </valueListItems>
                        <valueListItems>
                            <value>Global.NewContact</value>
                        </valueListItems>
                        <valueListItems>
                            <value>Global.NewOpportunity</value>
                        </valueListItems>
                    </valueList>
                </componentInstanceProperties>
                <componentInstanceProperties>
                    <name>numVisibleActions</name>
                    <value>4</value>
                </componentInstanceProperties>
                <componentInstanceProperties>
                    <name>primaryField</name>
                    <value>Facet-PrimaryFields</value>
                </componentInstanceProperties>
                <componentInstanceProperties>
                    <name>secondaryFields</name>
                    <value>Facet-SecondaryFields</value>
                </componentInstanceProperties>
                <componentName>record_flexipage:dynamicHighlights</componentName>
                <identifier>record_flexipage_dynamicHighlights</identifier>
            </componentInstance>
        </itemInstances>
        <name>header</name>
        <type>Region</type>
    </flexiPageRegions>\n`;

// Main Region with Rich Text (HOT ACCOUNT) and Tabset
const mainRegion = `    <flexiPageRegions>
        <itemInstances>
            <componentInstance>
                <componentInstanceProperties>
                    <name>decorate</name>
                    <value>true</value>
                </componentInstanceProperties>
                <componentInstanceProperties>
                    <name>richTextValue</name>
                    <value>&lt;p&gt;&lt;b&gt;HOT ACCOUNT&lt;/b&gt;&lt;/p&gt;</value>
                </componentInstanceProperties>
                <componentName>flexipage:richText</componentName>
                <identifier>flexipage_richText</identifier>
                <visibilityRule>
                    <criteria>
                        <leftValue>{!Record.Rating}</leftValue>
                        <operator>EQUAL</operator>
                        <rightValue>Hot</rightValue>
                    </criteria>
                </visibilityRule>
            </componentInstance>
        </itemInstances>
        <itemInstances>
            <componentInstance>
                <componentInstanceProperties>
                    <name>tabs</name>
                    <value>maintabs</value>
                </componentInstanceProperties>
                <componentName>flexipage:tabset</componentName>
                <identifier>flexipage_tabset</identifier>
            </componentInstance>
        </itemInstances>
        <name>main</name>
        <type>Region</type>
    </flexiPageRegions>\n`;

// Sidebar Region
const sidebarRegion = `    <flexiPageRegions>
        <name>sidebar</name>
        <type>Region</type>
    </flexiPageRegions>\n`;

const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<FlexiPage xmlns="http://soap.sforce.com/2006/04/metadata">
${dynHighlightsHeaderFacets}${accInfo.facetsXml}${addrInfo.facetsXml}${addlInfo.facetsXml}${sysInfo.facetsXml}${descInfo.facetsXml}${detailTabFacet}${moreInfoTabFacet}${activityFacet}${relatedFacet}${mainTabsFacet}${mainRegion}${sidebarRegion}    <masterLabel>New Account Page</masterLabel>
    <sobjectType>Account</sobjectType>
    <template>
        <name>flexipage:recordHomeTemplateDesktop</name>
    </template>
    <type>RecordPage</type>
</FlexiPage>
`;

fs.writeFileSync(targetPath, xmlContent, 'utf8');
console.log('Successfully wrote:', targetPath);
