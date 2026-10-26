const fs = require('fs');
const path = require('path');
const { grantFieldPermissionInProfile } = require('./metadata_builder');

const caseFieldsDir = path.resolve(__dirname, '..', 'force-app', 'main', 'default', 'objects', 'Case', 'fields');
if (!fs.existsSync(caseFieldsDir)) {
    fs.mkdirSync(caseFieldsDir, { recursive: true });
}

// 1. Backup_Agent__c on Case
const backupAgentXml = `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Backup_Agent__c</fullName>
    <deleteConstraint>SetNull</deleteConstraint>
    <description>Used to identify the assigned support rep when case owner is away — for support use only.</description>
    <inlineHelpText>Who is the assigned support rep when case owner is away?</inlineHelpText>
    <label>Backup Agent</label>
    <lookupFilter>
        <active>true</active>
        <filterItems>
            <field>User.Profile.Name</field>
            <operation>equals</operation>
            <value>Support User</value>
        </filterItems>
        <isOptional>false</isOptional>
    </lookupFilter>
    <referenceTo>User</referenceTo>
    <relationshipName>Cases</relationshipName>
    <required>false</required>
    <trackFeedHistory>false</trackFeedHistory>
    <trackHistory>false</trackHistory>
    <trackTrending>false</trackTrending>
    <type>Lookup</type>
</CustomField>
`;
fs.writeFileSync(path.join(caseFieldsDir, 'Backup_Agent__c.field-meta.xml'), backupAgentXml.trim(), 'utf8');
grantFieldPermissionInProfile('Case.Backup_Agent__c');
console.log('[Created] Case.Backup_Agent__c.field-meta.xml');

// 2. Lookup Filter on ContactId
const contactIdXml = `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>ContactId</fullName>
    <lookupFilter>
        <active>true</active>
        <filterItems>
            <field>Contact.AccountId</field>
            <operation>equals</operation>
            <valueField>Case.AccountId</valueField>
        </filterItems>
        <isOptional>false</isOptional>
    </lookupFilter>
    <trackFeedHistory>false</trackFeedHistory>
    <trackHistory>false</trackHistory>
    <trackTrending>false</trackTrending>
    <type>Lookup</type>
</CustomField>
`;
fs.writeFileSync(path.join(caseFieldsDir, 'ContactId.field-meta.xml'), contactIdXml.trim(), 'utf8');
console.log('[Created] Case.ContactId.field-meta.xml');
