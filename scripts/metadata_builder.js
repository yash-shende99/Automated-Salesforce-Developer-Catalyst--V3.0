const fs = require('fs');
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..', 'force-app', 'main', 'default');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function grantFieldPermissionInProfile(fullFieldApiName, editable = true) {
    const profilePath = path.join(BASE_DIR, 'profiles', 'Admin.profile-meta.xml');
    if (!fs.existsSync(profilePath)) return;
    let content = fs.readFileSync(profilePath, 'utf8');
    if (content.includes(`<field>${fullFieldApiName}</field>`)) return;
    const block = `    <fieldPermissions>\n        <editable>${editable ? 'true' : 'false'}</editable>\n        <field>${fullFieldApiName}</field>\n        <readable>true</readable>\n    </fieldPermissions>\n`;
    if (content.includes('<layoutAssignments>')) {
        content = content.replace('<layoutAssignments>', `${block}    <layoutAssignments>`);
    } else if (content.includes('<recordTypeVisibilities>')) {
        content = content.replace('<recordTypeVisibilities>', `${block}    <recordTypeVisibilities>`);
    } else {
        content = content.replace('</Profile>', `${block}</Profile>`);
    }
    fs.writeFileSync(profilePath, content, 'utf8');
    console.log(`[Added FLS to Profile] ${fullFieldApiName} (editable: ${editable})`);
}

function createFormulaField({ objectName, fieldName, label, description, helpText, returnType, formula, decimals = 2, formulaTreatBlanksAs = 'BlankAsZero' }) {
    const objDir = path.join(BASE_DIR, 'objects', objectName, 'fields');
    ensureDir(objDir);

    const safeFormula = escapeXml(formula);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>${fieldName}</fullName>
    <description>${description || label}</description>
    <inlineHelpText>${helpText || ''}</inlineHelpText>
    <externalId>false</externalId>
    <formula>${safeFormula}</formula>
    <formulaTreatBlanksAs>${formulaTreatBlanksAs}</formulaTreatBlanksAs>
    <label>${label}</label>
    <required>false</required>
    <trackTrending>false</trackTrending>
    <type>${returnType}</type>
    ${returnType === 'Number' || returnType === 'Currency' || returnType === 'Percent' ? `<precision>18</precision>\n    <scale>${decimals}</scale>` : ''}
    <unique>false</unique>
</CustomField>
`;

    const filePath = path.join(objDir, `${fieldName}.field-meta.xml`);
    fs.writeFileSync(filePath, xml.trim(), 'utf8');
    grantFieldPermissionInProfile(`${objectName}.${fieldName}`, false);
    console.log(`[Created FormulaField] ${filePath}`);
    return filePath;
}

function createCustomField({ objectName, fieldName, label, type, required = false, defaultValue = null, precision = 18, scale = 0, length = 255, referenceTo = null, relationshipLabel = null, relationshipName = null, deleteConstraint = 'SetNull', values = [] }) {
    const objDir = path.join(BASE_DIR, 'objects', objectName, 'fields');
    ensureDir(objDir);

    let extraXml = '';
    if (type === 'Text') {
        extraXml = `    <length>${length}</length>\n    <unique>false</unique>`;
    } else if (type === 'Number' || type === 'Currency' || type === 'Percent') {
        extraXml = `    <precision>${precision}</precision>\n    <scale>${scale}</scale>\n    <unique>false</unique>`;
    } else if (type === 'Checkbox') {
        extraXml = `    <defaultValue>${defaultValue !== null ? defaultValue : false}</defaultValue>`;
    } else if (type === 'Date') {
        // no extra tags needed
    } else if (type === 'Picklist') {
        const valSet = (values || []).map(v => `            <value>\n                <fullName>${escapeXml(v)}</fullName>\n                <default>false</default>\n                <label>${escapeXml(v)}</label>\n            </value>`).join('\n');
        extraXml = `    <valueSet>\n        <valueSetDefinition>\n            <sorted>false</sorted>\n${valSet}\n        </valueSetDefinition>\n    </valueSet>`;
    } else if (type === 'Lookup') {
        extraXml = `    <deleteConstraint>${deleteConstraint}</deleteConstraint>
    <referenceTo>${referenceTo}</referenceTo>
    <relationshipLabel>${relationshipLabel || label}</relationshipLabel>
    <relationshipName>${relationshipName || fieldName.replace('__c', 's')}</relationshipName>`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>${fieldName}</fullName>
    <externalId>false</externalId>
    <label>${label}</label>
    <required>${required}</required>
    <trackTrending>false</trackTrending>
    <type>${type}</type>
${extraXml}
</CustomField>
`;

    const filePath = path.join(objDir, `${fieldName}.field-meta.xml`);
    fs.writeFileSync(filePath, xml.trim(), 'utf8');
    grantFieldPermissionInProfile(`${objectName}.${fieldName}`, true);
    console.log(`[Created CustomField ${type}] ${filePath}`);
    return filePath;
}

function createGlobalValueSet({ name, description, values = [] }) {
    const gvsDir = path.join(BASE_DIR, 'globalValueSets');
    ensureDir(gvsDir);

    const valuesXml = values.map(v => `        <customValue>
            <fullName>${escapeXml(v)}</fullName>
            <default>false</default>
            <label>${escapeXml(v)}</label>
        </customValue>`).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<GlobalValueSet xmlns="http://soap.sforce.com/2006/04/metadata">
    <customValue>
${valuesXml}
    </customValue>
    <description>${description || name}</description>
    <masterLabel>${name}</masterLabel>
    <sorted>false</sorted>
</GlobalValueSet>
`;

    const filePath = path.join(gvsDir, `${name}.globalValueSet-meta.xml`);
    fs.writeFileSync(filePath, xml.trim(), 'utf8');
    console.log(`[Created GlobalValueSet] ${filePath}`);
    return filePath;
}

function createPicklistField({ objectName, fieldName, label, description, helpText, valueSetName = null, localValues = [], isMultiSelect = false, visibleLines = 4, controllingField = null, valueSettings = [] }) {
    const objDir = path.join(BASE_DIR, 'objects', objectName, 'fields');
    ensureDir(objDir);

    let valXml = '';
    if (valueSetName) {
        valXml = `    <valueSet>
        <restricted>true</restricted>
        <valueSetName>${valueSetName}</valueSetName>
    </valueSet>`;
    } else {
        const customVals = localValues.map(v => `            <value>
                <fullName>${escapeXml(v)}</fullName>
                <default>false</default>
                <label>${escapeXml(v)}</label>
            </value>`).join('\n');

        let settingsXml = '';
        if (valueSettings && valueSettings.length > 0) {
            settingsXml = valueSettings.map(s => `        <valueSettings>
            <controllingFieldValue>${escapeXml(s.controllingValue)}</controllingFieldValue>
            <valueName>${escapeXml(s.valueName)}</valueName>
        </valueSettings>`).join('\n');
        }

        let ctrlXml = controllingField ? `        <controllingField>${controllingField}</controllingField>\n` : '';

        valXml = `    <valueSet>
${ctrlXml}        <restricted>true</restricted>
        <valueSetDefinition>
            <sorted>false</sorted>
${customVals}
        </valueSetDefinition>
${settingsXml}
    </valueSet>`;
    }

    const typeStr = isMultiSelect ? 'MultiselectPicklist' : 'Picklist';
    const linesStr = isMultiSelect ? `    <visibleLines>${visibleLines}</visibleLines>\n` : '';

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>${fieldName}</fullName>
    <description>${description || label}</description>
    <inlineHelpText>${helpText || ''}</inlineHelpText>
    <label>${label}</label>
    <required>false</required>
    <trackFeedHistory>false</trackFeedHistory>
    <type>${typeStr}</type>
${linesStr}${valXml}
</CustomField>
`;

    const filePath = path.join(objDir, `${fieldName}.field-meta.xml`);
    fs.writeFileSync(filePath, xml.trim(), 'utf8');
    grantFieldPermissionInProfile(`${objectName}.${fieldName}`);
    console.log(`[Created ${typeStr}] ${filePath}`);
    return filePath;
}

function createValidationRule({ objectName, ruleName, description, active = true, errorConditionFormula, errorMessage, errorDisplayField = null }) {
    const valDir = path.join(BASE_DIR, 'objects', objectName, 'validationRules');
    ensureDir(valDir);

    const safeFormula = escapeXml(errorConditionFormula);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ValidationRule xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>${ruleName}</fullName>
    <active>${active}</active>
    <description>${description || ruleName}</description>
    <errorConditionFormula>${safeFormula}</errorConditionFormula>
    ${errorDisplayField ? `<errorDisplayField>${errorDisplayField}</errorDisplayField>` : ''}
    <errorMessage>${errorMessage}</errorMessage>
</ValidationRule>
`;

    const filePath = path.join(valDir, `${ruleName}.validationRule-meta.xml`);
    fs.writeFileSync(filePath, xml.trim(), 'utf8');
    console.log(`[Created ValidationRule] ${filePath}`);
    return filePath;
}

function createApexClass({ className, code, apiVersion = '60.0' }) {
    const classDir = path.join(BASE_DIR, 'classes');
    ensureDir(classDir);

    const clsPath = path.join(classDir, `${className}.cls`);
    const metaPath = path.join(classDir, `${className}.cls-meta.xml`);

    const metaXml = `<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>${apiVersion}</apiVersion>
    <status>Active</status>
</ApexClass>
`;

    fs.writeFileSync(clsPath, code.trim(), 'utf8');
    fs.writeFileSync(metaPath, metaXml.trim(), 'utf8');
    console.log(`[Created ApexClass] ${clsPath}`);
    return { clsPath, metaPath };
}

function grantRecordTypePermissionInProfile(recordTypeFullName, isDefault = false) {
    const profilePath = path.join(BASE_DIR, 'profiles', 'Admin.profile-meta.xml');
    if (!fs.existsSync(profilePath)) return;
    let content = fs.readFileSync(profilePath, 'utf8');
    if (content.includes(`<recordType>${recordTypeFullName}</recordType>`)) return;
    const block = `    <recordTypeVisibilities>\n        <default>${isDefault ? 'true' : 'false'}</default>\n        <recordType>${recordTypeFullName}</recordType>\n        <visible>true</visible>\n    </recordTypeVisibilities>\n`;
    if (content.includes('<tabVisibilities>')) {
        content = content.replace('<tabVisibilities>', `${block}    <tabVisibilities>`);
    } else {
        content = content.replace('</Profile>', `${block}</Profile>`);
    }
    fs.writeFileSync(profilePath, content, 'utf8');
    console.log(`[Added RecordType Visibility to Profile] ${recordTypeFullName}`);
}

function createRecordType({ objectName, recordTypeName, label, description, active = true, isDefault = false, picklistValues = [] }) {
    const rtDir = path.join(BASE_DIR, 'objects', objectName, 'recordTypes');
    ensureDir(rtDir);

    let picklistXml = '';
    for (const pv of picklistValues) {
        const vals = pv.values.map(v => `        <values>\n            <fullName>${escapeXml(v)}</fullName>\n            <default>false</default>\n        </values>`).join('\n');
        picklistXml += `    <picklistValues>\n        <picklist>${escapeXml(pv.picklist)}</picklist>\n${vals}\n    </picklistValues>\n`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<RecordType xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>${recordTypeName}</fullName>
    <active>${active}</active>
    <description>${description || label}</description>
    <label>${label}</label>
${picklistXml}</RecordType>
`;

    const filePath = path.join(rtDir, `${recordTypeName}.recordType-meta.xml`);
    fs.writeFileSync(filePath, xml.trim(), 'utf8');
    grantRecordTypePermissionInProfile(`${objectName}.${recordTypeName}`, isDefault);
    console.log(`[Created RecordType] ${filePath}`);
    return filePath;
}

function createRollUpSummaryField({ objectName, fieldName, label, summaryForeignKey, summaryOperation, summarizedField = null }) {
    const objDir = path.join(BASE_DIR, 'objects', objectName, 'fields');
    ensureDir(objDir);

    let sumFieldXml = summarizedField ? `    <summarizedField>${summarizedField}</summarizedField>\n` : '';

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>${fieldName}</fullName>
    <externalId>false</externalId>
    <label>${label}</label>
${sumFieldXml}    <summaryForeignKey>${summaryForeignKey}</summaryForeignKey>
    <summaryOperation>${summaryOperation}</summaryOperation>
    <trackTrending>false</trackTrending>
    <type>Summary</type>
</CustomField>
`;

    const filePath = path.join(objDir, `${fieldName}.field-meta.xml`);
    fs.writeFileSync(filePath, xml.trim(), 'utf8');
    grantFieldPermissionInProfile(`${objectName}.${fieldName}`, false);
    console.log(`[Created RollUpSummaryField] ${filePath}`);
    return filePath;
}

function createCustomObject({ objectName, label, pluralLabel, nameFieldLabel = null, nameFieldType = 'Text', sharingModel = 'ReadWrite', enableReports = true }) {
    const objDir = path.join(BASE_DIR, 'objects', objectName);
    ensureDir(objDir);

    const nfLabel = nameFieldLabel || label;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <actionOverrides>
        <actionName>Accept</actionName>
        <type>Default</type>
    </actionOverrides>
    <deploymentStatus>Deployed</deploymentStatus>
    <enableActivities>false</enableActivities>
    <enableBulkApi>true</enableBulkApi>
    <enableFeeds>false</enableFeeds>
    <enableHistory>false</enableHistory>
    <enableReports>${enableReports}</enableReports>
    <enableSearch>true</enableSearch>
    <enableSharing>true</enableSharing>
    <enableStreamingApi>true</enableStreamingApi>
    <label>${label}</label>
    <nameField>
        <label>${nfLabel}</label>
        <type>${nameFieldType}</type>
    </nameField>
    <pluralLabel>${pluralLabel || label + 's'}</pluralLabel>
    <sharingModel>${sharingModel}</sharingModel>
</CustomObject>
`;

    const filePath = path.join(objDir, `${objectName}.object-meta.xml`);
    fs.writeFileSync(filePath, xml.trim(), 'utf8');
    console.log(`[Created CustomObject] ${filePath}`);
    return filePath;
}

function createCustomTab({ customObject, motif = 'Custom67: Map' }) {
    const tabDir = path.join(BASE_DIR, 'tabs');
    ensureDir(tabDir);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<CustomTab xmlns="http://soap.sforce.com/2006/04/metadata">
    <customObject>true</customObject>
    <motif>${motif}</motif>
</CustomTab>
`;

    const filePath = path.join(tabDir, `${customObject}.tab-meta.xml`);
    fs.writeFileSync(filePath, xml.trim(), 'utf8');
    console.log(`[Created CustomTab] ${filePath}`);
    return filePath;
}

module.exports = {
    createCustomField,
    createFormulaField,
    createRollUpSummaryField,
    createCustomObject,
    createCustomTab,
    createGlobalValueSet,
    createPicklistField,
    createValidationRule,
    createApexClass,
    createRecordType,
    grantFieldPermissionInProfile,
    grantRecordTypePermissionInProfile
};
