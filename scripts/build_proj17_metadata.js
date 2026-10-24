const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE_DIR = path.join(__dirname, '..', 'force-app', 'main', 'default');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeFile(relPath, content) {
  const fullPath = path.join(BASE_DIR, relPath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log(`[WROTE] ${relPath}`);
}

async function main() {
  // Query exact Allison Wheeler username
  const userRes = JSON.parse(execSync('sf data query --query "SELECT Username FROM User WHERE Name = \'Allison Wheeler\' LIMIT 1" --target-org friend_org --json').toString());
  const allisonUsername = userRes.result.records[0].Username;
  console.log(`[Allison Wheeler Username]: ${allisonUsername}`);

  // 1. Opportunity Fields
  writeFile('objects/Opportunity/fields/Discount_Percentage__c.field-meta.xml', `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Discount_Percentage__c</fullName>
    <externalId>false</externalId>
    <label>Discount Percentage</label>
    <precision>4</precision>
    <required>false</required>
    <scale>2</scale>
    <trackTrending>false</trackTrending>
    <type>Percent</type>
    <unique>false</unique>
</CustomField>`);

  writeFile('objects/Opportunity/fields/Approval_Status__c.field-meta.xml', `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Approval_Status__c</fullName>
    <label>Approval Status</label>
    <required>false</required>
    <trackTrending>false</trackTrending>
    <type>Picklist</type>
    <valueSet>
        <restricted>true</restricted>
        <valueSetDefinition>
            <sorted>false</sorted>
            <value><fullName>Pending</fullName><default>false</default><label>Pending</label></value>
            <value><fullName>Approved</fullName><default>false</default><label>Approved</label></value>
            <value><fullName>Not Approved</fullName><default>false</default><label>Not Approved</label></value>
        </valueSetDefinition>
    </valueSet>
</CustomField>`);

  // 2. Email Folder & Templates
  writeFile('email/Discount_Request_Responses-meta.xml', `<?xml version="1.0" encoding="UTF-8"?>
<EmailFolder xmlns="http://soap.sforce.com/2006/04/metadata">
    <accessType>Public</accessType>
    <name>Discount Request Responses</name>
    <publicFolderAccess>ReadWrite</publicFolderAccess>
</EmailFolder>`);

  writeFile('email/Discount_Request_Responses/Discount_Approved.email-meta.xml', `<?xml version="1.0" encoding="UTF-8"?>
<EmailTemplate xmlns="http://soap.sforce.com/2006/04/metadata">
    <available>true</available>
    <description>Used to alert requestors that a discount has been approved</description>
    <encodingKey>ISO-8859-1</encodingKey>
    <name>Discount Approved</name>
    <style>none</style>
    <subject>Your Discount Request Was Approved</subject>
    <type>text</type>
    <uiType>Aloha</uiType>
</EmailTemplate>`);

  writeFile('email/Discount_Request_Responses/Discount_Approved.email', `Dear {!Opportunity.OwnerFullName}, Good news! Your recent discount request has been approved. Please log in to your org for details. Best, Allison Wheeler VP, North American Sales`);

  writeFile('email/Discount_Request_Responses/Discount_Rejected.email-meta.xml', `<?xml version="1.0" encoding="UTF-8"?>
<EmailTemplate xmlns="http://soap.sforce.com/2006/04/metadata">
    <available>true</available>
    <description>Used to alert requestors that a discount has been rejected</description>
    <encodingKey>ISO-8859-1</encodingKey>
    <name>Discount Rejected</name>
    <style>none</style>
    <subject>Your Discount Request Was Rejected</subject>
    <type>text</type>
    <uiType>Aloha</uiType>
</EmailTemplate>`);

  writeFile('email/Discount_Request_Responses/Discount_Rejected.email', `Dear {!Opportunity.OwnerFullName}, Unfortunately, your recent discount request has been rejected. Please log in to your org for details. Best, Allison Wheeler VP, North American Sales`);

  // 3. Workflow on Opportunity
  writeFile('workflows/Opportunity.workflow-meta.xml', `<?xml version="1.0" encoding="UTF-8"?>
<Workflow xmlns="http://soap.sforce.com/2006/04/metadata">
    <alerts>
        <fullName>Discount_Approved</fullName>
        <description>Discount Approved</description>
        <protected>false</protected>
        <recipients>
            <type>owner</type>
        </recipients>
        <senderType>CurrentUser</senderType>
        <template>Discount_Request_Responses/Discount_Approved</template>
    </alerts>
    <alerts>
        <fullName>Discount_Rejected</fullName>
        <description>Discount Rejected</description>
        <protected>false</protected>
        <recipients>
            <type>owner</type>
        </recipients>
        <senderType>CurrentUser</senderType>
        <template>Discount_Request_Responses/Discount_Rejected</template>
    </alerts>
    <fieldUpdates>
        <fullName>Approval_Status_Pending</fullName>
        <field>Approval_Status__c</field>
        <literalValue>Pending</literalValue>
        <name>Approval Status Pending</name>
        <notifyAssignee>false</notifyAssignee>
        <operation>Literal</operation>
        <protected>false</protected>
        <reevaluateOnChange>false</reevaluateOnChange>
    </fieldUpdates>
    <fieldUpdates>
        <fullName>Approval_Status_to_Approved</fullName>
        <field>Approval_Status__c</field>
        <literalValue>Approved</literalValue>
        <name>Approval Status to Approved</name>
        <notifyAssignee>false</notifyAssignee>
        <operation>Literal</operation>
        <protected>false</protected>
        <reevaluateOnChange>false</reevaluateOnChange>
    </fieldUpdates>
    <fieldUpdates>
        <fullName>Approval_Status_to_Not_Approved</fullName>
        <field>Approval_Status__c</field>
        <literalValue>Not Approved</literalValue>
        <name>Approval Status to Not Approved</name>
        <notifyAssignee>false</notifyAssignee>
        <operation>Literal</operation>
        <protected>false</protected>
        <reevaluateOnChange>false</reevaluateOnChange>
    </fieldUpdates>
    <fieldUpdates>
        <fullName>Clear_Discount_Percentage</fullName>
        <field>Discount_Percentage__c</field>
        <name>Clear Discount Percentage</name>
        <notifyAssignee>false</notifyAssignee>
        <operation>Null</operation>
        <protected>false</protected>
        <reevaluateOnChange>false</reevaluateOnChange>
    </fieldUpdates>
</Workflow>`);

  // 4. Approval Process on Opportunity
  writeFile('approvalProcesses/Opportunity.Discount_Approval_Process.approvalProcess-meta.xml', `<?xml version="1.0" encoding="UTF-8"?>
<ApprovalProcess xmlns="http://soap.sforce.com/2006/04/metadata">
    <active>true</active>
    <allowRecall>false</allowRecall>
    <allowedSubmitters>
        <type>owner</type>
    </allowedSubmitters>
    <approvalPageFields>
        <field>Name</field>
        <field>Owner</field>
        <field>Amount</field>
        <field>Discount_Percentage__c</field>
    </approvalPageFields>
    <approvalStep>
        <allowDelegate>false</allowDelegate>
        <assignedApprover>
            <approver>
                <type>userHierarchyField</type>
            </approver>
        </assignedApprover>
        <description>Discount approver must approve discounts over 15%</description>
        <entryCriteria>
            <criteriaItems>
                <field>Opportunity.Discount_Percentage__c</field>
                <operation>greaterThan</operation>
                <value>15</value>
            </criteriaItems>
        </entryCriteria>
        <ifCriteriaNotMet>ApproveRecord</ifCriteriaNotMet>
        <label>Manager Approval</label>
        <name>Manager_Approval</name>
    </approvalStep>
    <approvalStep>
        <allowDelegate>false</allowDelegate>
        <assignedApprover>
            <approver>
                <name>${allisonUsername}</name>
                <type>user</type>
            </approver>
            <whenMultipleApprovers>FirstResponse</whenMultipleApprovers>
        </assignedApprover>
        <description>VP North American Sales must approve discounts over 40%</description>
        <entryCriteria>
            <criteriaItems>
                <field>Opportunity.Discount_Percentage__c</field>
                <operation>greaterThan</operation>
                <value>40</value>
            </criteriaItems>
        </entryCriteria>
        <label>VP Approval</label>
        <name>VP_Approval</name>
        <rejectBehavior>
            <type>RejectRequest</type>
        </rejectBehavior>
    </approvalStep>
    <description>Automates opportunity discount approvals</description>
    <enableMobileDeviceAccess>false</enableMobileDeviceAccess>
    <entryCriteria>
        <criteriaItems>
            <field>Opportunity.Discount_Percentage__c</field>
            <operation>greaterThan</operation>
            <value>0</value>
        </criteriaItems>
    </entryCriteria>
    <finalApprovalActions>
        <action>
            <name>Approval_Status_to_Approved</name>
            <type>FieldUpdate</type>
        </action>
        <action>
            <name>Discount_Approved</name>
            <type>Alert</type>
        </action>
    </finalApprovalActions>
    <finalApprovalRecordLock>false</finalApprovalRecordLock>
    <finalRejectionActions>
        <action>
            <name>Approval_Status_to_Not_Approved</name>
            <type>FieldUpdate</type>
        </action>
        <action>
            <name>Clear_Discount_Percentage</name>
            <type>FieldUpdate</type>
        </action>
        <action>
            <name>Discount_Rejected</name>
            <type>Alert</type>
        </action>
    </finalRejectionActions>
    <finalRejectionRecordLock>false</finalRejectionRecordLock>
    <initialSubmissionActions>
        <action>
            <name>Approval_Status_Pending</name>
            <type>FieldUpdate</type>
        </action>
    </initialSubmissionActions>
    <label>Discount Approval Process</label>
    <nextAutomatedApprover>
        <useApproverFieldOfRecordOwner>true</useApproverFieldOfRecordOwner>
        <userHierarchyField>Manager</userHierarchyField>
    </nextAutomatedApprover>
    <recordEditability>AdminOnly</recordEditability>
    <showApprovalHistory>true</showApprovalHistory>
</ApprovalProcess>`);

  console.log('\nProject 17 metadata generated successfully!');
}

main().catch(console.error);
