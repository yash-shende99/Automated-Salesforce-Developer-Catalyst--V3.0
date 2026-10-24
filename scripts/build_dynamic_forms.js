const fs = require('fs');
const path = require('path');

const FLEXI_DIR = path.resolve(__dirname, '..', 'force-app', 'main', 'default', 'flexipages');

function buildDynamicFormsPages() {
    let facetCount = 1;
    function nextFacet(prefix = 'Facet') {
        return `${prefix}_${facetCount++}`;
    }

    // Helper to generate a 2-column section
    function makeTwoColSection(label, col1Fields, col2Fields) {
        const col1Facet = nextFacet('Col1');
        const col2Facet = nextFacet('Col2');
        const sectionColumnsFacet = nextFacet('SecCols');

        let col1Xml = `    <flexiPageRegions>\n`;
        for (const f of col1Fields) {
            col1Xml += `        <itemInstances>
            <fieldInstance>
                <fieldInstanceProperties>
                    <name>uiBehavior</name>
                    <value>${f.required ? 'required' : 'none'}</value>
                </fieldInstanceProperties>
                <fieldItem>Record.${f.name}</fieldItem>
                <identifier>Record_${f.name.replace(/[^a-zA-Z0-9]/g, '_')}</identifier>
            </fieldInstance>
        </itemInstances>\n`;
        }
        col1Xml += `        <name>${col1Facet}</name>\n        <type>Facet</type>\n    </flexiPageRegions>\n`;

        let col2Xml = `    <flexiPageRegions>\n`;
        for (const f of col2Fields) {
            col2Xml += `        <itemInstances>
            <fieldInstance>
                <fieldInstanceProperties>
                    <name>uiBehavior</name>
                    <value>${f.required ? 'required' : 'none'}</value>
                </fieldInstanceProperties>
                <fieldItem>Record.${f.name}</fieldItem>
                <identifier>Record_${f.name.replace(/[^a-zA-Z0-9]/g, '_')}</identifier>
            </fieldInstance>
        </itemInstances>\n`;
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
        <name>${sectionColumnsFacet}</name>
        <type>Facet</type>
    </flexiPageRegions>\n`;

        const sectionComponentInstance = `        <itemInstances>
            <componentInstance>
                <componentInstanceProperties>
                    <name>columns</name>
                    <value>${sectionColumnsFacet}</value>
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
                <identifier>sec_${sectionColumnsFacet}</identifier>
            </componentInstance>
        </itemInstances>\n`;

        return {
            facetsXml: col1Xml + col2Xml + colsXml,
            sectionComponentInstance
        };
    }

    // --- Customer Account Page ---
    const custAccInfo = makeTwoColSection('Account Information', [
        { name: 'Name', required: true },
        { name: 'ParentId' },
        { name: 'AccountNumber' },
        { name: 'Site' },
        { name: 'Type' },
        { name: 'Industry' },
        { name: 'AnnualRevenue' }
    ], [
        { name: 'Rating', required: true },
        { name: 'Phone' },
        { name: 'Fax' },
        { name: 'Website' },
        { name: 'TickerSymbol' },
        { name: 'Ownership' },
        { name: 'NumberOfEmployees' }
    ]);

    const custSalesRegion = makeTwoColSection('Sales Region', [
        { name: 'Region__c' }
    ], [
        { name: 'Zone__c' }
    ]);

    const custSupportPlan = makeTwoColSection('Support Plan Information', [
        { name: 'Has_Support_Plan__c' }
    ], [
        { name: 'Support_Plan_Expiration_Date__c' }
    ]);

    const custDetailTabFacet = nextFacet('CustDetailTab');
    const custDetailTabXml = `    <flexiPageRegions>\n` +
        custAccInfo.sectionComponentInstance +
        custSalesRegion.sectionComponentInstance +
        custSupportPlan.sectionComponentInstance +
        `        <name>${custDetailTabFacet}</name>\n        <type>Facet</type>\n    </flexiPageRegions>\n`;

    const custMainXml = `    <flexiPageRegions>
        <itemInstances>
            <componentInstance>
                <componentInstanceProperties>
                    <name>body</name>
                    <value>${custDetailTabFacet}</value>
                </componentInstanceProperties>
                <componentInstanceProperties>
                    <name>title</name>
                    <value>Standard.Tab.detail</value>
                </componentInstanceProperties>
                <componentName>flexipage:tab</componentName>
                <identifier>detailTab</identifier>
            </componentInstance>
        </itemInstances>
        <name>maintabs</name>
        <type>Facet</type>
    </flexiPageRegions>
    <flexiPageRegions>
        <itemInstances>
            <componentInstance>
                <componentInstanceProperties>
                    <name>tabs</name>
                    <value>maintabs</value>
                </componentInstanceProperties>
                <componentName>flexipage:tabset</componentName>
                <identifier>main_tabset</identifier>
            </componentInstance>
        </itemInstances>
        <name>main</name>
        <type>Region</type>
    </flexiPageRegions>
    <flexiPageRegions>
        <itemInstances>
            <componentInstance>
                <componentName>force:highlightsPanel</componentName>
                <identifier>header_highlights</identifier>
            </componentInstance>
        </itemInstances>
        <name>header</name>
        <type>Region</type>
    </flexiPageRegions>\n`;

    const custXml = `<?xml version="1.0" encoding="UTF-8"?>
<FlexiPage xmlns="http://soap.sforce.com/2006/04/metadata">
${custAccInfo.facetsXml}${custSalesRegion.facetsXml}${custSupportPlan.facetsXml}${custDetailTabXml}${custMainXml}    <masterLabel>Customer Account Page</masterLabel>
    <sobjectType>Account</sobjectType>
    <template>
        <name>flexipage:recordHomeTemplateDesktop</name>
    </template>
    <type>RecordPage</type>
</FlexiPage>
`;
    fs.writeFileSync(path.join(FLEXI_DIR, 'Customer_Account_Page.flexipage-meta.xml'), custXml.trim(), 'utf8');
    console.log('[Generated Dynamic Forms] Customer_Account_Page.flexipage-meta.xml');

    // --- Partner Account Page ---
    // Remove Rating, Region, Zone, Has Support Plan, Support Plan Expiration Date
    const partAccInfo = makeTwoColSection('Account Information', [
        { name: 'Name', required: true },
        { name: 'ParentId' },
        { name: 'AccountNumber' },
        { name: 'Site' },
        { name: 'Type' },
        { name: 'Industry' },
        { name: 'AnnualRevenue' }
    ], [
        { name: 'Phone' },
        { name: 'Fax' },
        { name: 'Website' },
        { name: 'TickerSymbol' },
        { name: 'Ownership' },
        { name: 'NumberOfEmployees' }
    ]);

    const partDetailTabFacet = nextFacet('PartDetailTab');
    const partDetailTabXml = `    <flexiPageRegions>\n` +
        partAccInfo.sectionComponentInstance +
        `        <name>${partDetailTabFacet}</name>\n        <type>Facet</type>\n    </flexiPageRegions>\n`;

    const partMainXml = `    <flexiPageRegions>
        <itemInstances>
            <componentInstance>
                <componentInstanceProperties>
                    <name>body</name>
                    <value>${partDetailTabFacet}</value>
                </componentInstanceProperties>
                <componentInstanceProperties>
                    <name>title</name>
                    <value>Standard.Tab.detail</value>
                </componentInstanceProperties>
                <componentName>flexipage:tab</componentName>
                <identifier>part_detailTab</identifier>
            </componentInstance>
        </itemInstances>
        <name>part_maintabs</name>
        <type>Facet</type>
    </flexiPageRegions>
    <flexiPageRegions>
        <itemInstances>
            <componentInstance>
                <componentInstanceProperties>
                    <name>tabs</name>
                    <value>part_maintabs</value>
                </componentInstanceProperties>
                <componentName>flexipage:tabset</componentName>
                <identifier>part_main_tabset</identifier>
            </componentInstance>
        </itemInstances>
        <name>main</name>
        <type>Region</type>
    </flexiPageRegions>
    <flexiPageRegions>
        <itemInstances>
            <componentInstance>
                <componentName>force:highlightsPanel</componentName>
                <identifier>part_header_highlights</identifier>
            </componentInstance>
        </itemInstances>
        <name>header</name>
        <type>Region</type>
    </flexiPageRegions>\n`;

    const partXml = `<?xml version="1.0" encoding="UTF-8"?>
<FlexiPage xmlns="http://soap.sforce.com/2006/04/metadata">
${partAccInfo.facetsXml}${partDetailTabXml}${partMainXml}    <masterLabel>Partner Account Page</masterLabel>
    <sobjectType>Account</sobjectType>
    <template>
        <name>flexipage:recordHomeTemplateDesktop</name>
    </template>
    <type>RecordPage</type>
</FlexiPage>
`;
    fs.writeFileSync(path.join(FLEXI_DIR, 'Partner_Account_Page.flexipage-meta.xml'), partXml.trim(), 'utf8');
    console.log('[Generated Dynamic Forms] Partner_Account_Page.flexipage-meta.xml');
}

if (require.main === module) {
    buildDynamicFormsPages();
}

module.exports = { buildDynamicFormsPages };
