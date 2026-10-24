const fs = require('fs');
const path = require('path');

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

// 1. Position__c fields
const positionFields = {
  'Status__c': `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Status__c</fullName>
    <label>Status</label>
    <required>false</required>
    <trackTrending>false</trackTrending>
    <type>Picklist</type>
    <valueSet>
        <restricted>false</restricted>
        <valueSetDefinition>
            <sorted>false</sorted>
            <value><fullName>New</fullName><default>true</default><label>New</label></value>
            <value><fullName>Pending Approval</fullName><default>false</default><label>Pending Approval</label></value>
            <value><fullName>Open</fullName><default>false</default><label>Open</label></value>
            <value><fullName>Closed</fullName><default>false</default><label>Closed</label></value>
            <value><fullName>Cancelled</fullName><default>false</default><label>Cancelled</label></value>
        </valueSetDefinition>
    </valueSet>
</CustomField>`,

  'Approval_Status__c': `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Approval_Status__c</fullName>
    <label>Approval Status</label>
    <required>false</required>
    <trackTrending>false</trackTrending>
    <type>Picklist</type>
    <valueSet>
        <restricted>false</restricted>
        <valueSetDefinition>
            <sorted>false</sorted>
            <value><fullName>Pending</fullName><default>false</default><label>Pending</label></value>
            <value><fullName>Approved</fullName><default>false</default><label>Approved</label></value>
            <value><fullName>Not Approved</fullName><default>false</default><label>Not Approved</label></value>
            <value><fullName>Recalled</fullName><default>false</default><label>Recalled</label></value>
        </valueSetDefinition>
    </valueSet>
</CustomField>`,

  'Job_Description__c': `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Job_Description__c</fullName>
    <label>Job Description</label>
    <length>32768</length>
    <trackTrending>false</trackTrending>
    <type>LongTextArea</type>
    <visibleLines>3</visibleLines>
</CustomField>`,

  'Skills_Required__c': `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Skills_Required__c</fullName>
    <label>Skills Required</label>
    <length>32768</length>
    <trackTrending>false</trackTrending>
    <type>LongTextArea</type>
    <visibleLines>3</visibleLines>
</CustomField>`,

  'Education__c': `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Education__c</fullName>
    <label>Education</label>
    <required>false</required>
    <trackTrending>false</trackTrending>
    <type>Picklist</type>
    <valueSet>
        <restricted>false</restricted>
        <valueSetDefinition>
            <sorted>false</sorted>
            <value><fullName>High School</fullName><default>false</default><label>High School</label></value>
            <value><fullName>Associate&apos;s Degree</fullName><default>false</default><label>Associate&apos;s Degree</label></value>
            <value><fullName>Bachelor&apos;s Degree</fullName><default>false</default><label>Bachelor&apos;s Degree</label></value>
            <value><fullName>Master&apos;s Degree</fullName><default>false</default><label>Master&apos;s Degree</label></value>
            <value><fullName>Doctorate</fullName><default>false</default><label>Doctorate</label></value>
        </valueSetDefinition>
    </valueSet>
</CustomField>`,

  'Salary_Range__c': `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Salary_Range__c</fullName>
    <label>Salary Range</label>
    <required>false</required>
    <trackTrending>false</trackTrending>
    <type>Picklist</type>
    <valueSet>
        <restricted>false</restricted>
        <valueSetDefinition>
            <sorted>false</sorted>
            <value><fullName>50K-70K</fullName><default>false</default><label>50K-70K</label></value>
            <value><fullName>70K-90K</fullName><default>false</default><label>70K-90K</label></value>
            <value><fullName>90K-120K</fullName><default>false</default><label>90K-120K</label></value>
            <value><fullName>120K+</fullName><default>false</default><label>120K+</label></value>
        </valueSetDefinition>
    </valueSet>
</CustomField>`,

  'Pay_Grade__c': `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Pay_Grade__c</fullName>
    <label>Pay Grade</label>
    <required>false</required>
    <trackTrending>false</trackTrending>
    <type>Picklist</type>
    <valueSet>
        <restricted>false</restricted>
        <valueSetDefinition>
            <sorted>false</sorted>
            <value><fullName>S-100</fullName><default>false</default><label>S-100</label></value>
            <value><fullName>S-200</fullName><default>false</default><label>S-200</label></value>
            <value><fullName>S-300</fullName><default>false</default><label>S-300</label></value>
            <value><fullName>S-400</fullName><default>false</default><label>S-400</label></value>
        </valueSetDefinition>
    </valueSet>
</CustomField>`,

  'Location__c': `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Location__c</fullName>
    <label>Location</label>
    <required>false</required>
    <trackTrending>false</trackTrending>
    <type>Picklist</type>
    <valueSet>
        <restricted>false</restricted>
        <valueSetDefinition>
            <sorted>false</sorted>
            <value><fullName>US</fullName><default>false</default><label>US</label></value>
            <value><fullName>UK</fullName><default>false</default><label>UK</label></value>
            <value><fullName>Japan</fullName><default>false</default><label>Japan</label></value>
            <value><fullName>Germany</fullName><default>false</default><label>Germany</label></value>
            <value><fullName>Australia</fullName><default>false</default><label>Australia</label></value>
        </valueSetDefinition>
    </valueSet>
</CustomField>`,

  'Approver_1__c': `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Approver_1__c</fullName>
    <deleteConstraint>SetNull</deleteConstraint>
    <label>Approver 1</label>
    <referenceTo>User</referenceTo>
    <relationshipLabel>Positions (Approver 1)</relationshipLabel>
    <relationshipName>Positions_Approver_1</relationshipName>
    <required>false</required>
    <trackTrending>false</trackTrending>
    <type>Lookup</type>
</CustomField>`,

  'Approver_2__c': `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Approver_2__c</fullName>
    <deleteConstraint>SetNull</deleteConstraint>
    <label>Approver 2</label>
    <referenceTo>User</referenceTo>
    <relationshipLabel>Positions (Approver 2)</relationshipLabel>
    <relationshipName>Positions_Approver_2</relationshipName>
    <required>false</required>
    <trackTrending>false</trackTrending>
    <type>Lookup</type>
</CustomField>`,

  'Approver_3__c': `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Approver_3__c</fullName>
    <deleteConstraint>SetNull</deleteConstraint>
    <label>Approver 3</label>
    <referenceTo>User</referenceTo>
    <relationshipLabel>Positions (Approver 3)</relationshipLabel>
    <relationshipName>Positions_Approver_3</relationshipName>
    <required>false</required>
    <trackTrending>false</trackTrending>
    <type>Lookup</type>
</CustomField>`
};

for (const [name, xml] of Object.entries(positionFields)) {
  writeFile(`objects/Position__c/fields/${name}.field-meta.xml`, xml);
}

// 2. Review__c comments fields
const reviewFields = {
  'Core_Competencies_Comments__c': `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Core_Competencies_Comments__c</fullName>
    <label>Core Competencies Comments</label>
    <required>false</required>
    <trackTrending>false</trackTrending>
    <type>TextArea</type>
</CustomField>`,

  'Experience_Comments__c': `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Experience_Comments__c</fullName>
    <label>Experience Comments</label>
    <required>false</required>
    <trackTrending>false</trackTrending>
    <type>TextArea</type>
</CustomField>`,

  'Leadership_Skills_Comments__c': `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Leadership_Skills_Comments__c</fullName>
    <label>Leadership Skills Comments</label>
    <required>false</required>
    <trackTrending>false</trackTrending>
    <type>TextArea</type>
</CustomField>`
};

for (const [name, xml] of Object.entries(reviewFields)) {
  writeFile(`objects/Review__c/fields/${name}.field-meta.xml`, xml);
}

// 3. Interviewer__c Custom Object
writeFile('objects/Interviewer__c/Interviewer__c.object-meta.xml', `<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <actionOverrides>
        <actionName>Accept</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>CancelEdit</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>Clone</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>Delete</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>Edit</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>List</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>New</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>SaveEdit</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>Tab</actionName>
        <type>Default</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>View</actionName>
        <type>Default</type>
    </actionOverrides>
    <allowInChatterGroups>false</allowInChatterGroups>
    <compactLayoutAssignment>SYSTEM</compactLayoutAssignment>
    <deploymentStatus>Deployed</deploymentStatus>
    <enableActivities>false</enableActivities>
    <enableBulkApi>true</enableBulkApi>
    <enableFeeds>false</enableFeeds>
    <enableHistory>false</enableHistory>
    <enableLicensing>false</enableLicensing>
    <enableReports>true</enableReports>
    <enableSearch>true</enableSearch>
    <enableSharing>true</enableSharing>
    <enableStreamingApi>true</enableStreamingApi>
    <label>Interviewer</label>
    <nameField>
        <displayFormat>INT-{0000}</displayFormat>
        <label>Interviewer Number</label>
        <type>AutoNumber</type>
    </nameField>
    <pluralLabel>Interviewers</pluralLabel>
    <sharingModel>ControlledByParent</sharingModel>
    <visibility>Public</visibility>
</CustomObject>`);

writeFile('objects/Interviewer__c/fields/Position__c.field-meta.xml', `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Position__c</fullName>
    <label>Position</label>
    <referenceTo>Position__c</referenceTo>
    <relationshipLabel>Interviewers</relationshipLabel>
    <relationshipName>Interviewers</relationshipName>
    <relationshipOrder>0</relationshipOrder>
    <reparentableMasterDetail>false</reparentableMasterDetail>
    <trackTrending>false</trackTrending>
    <type>MasterDetail</type>
    <writeRequiresMasterRead>false</writeRequiresMasterRead>
</CustomField>`);

writeFile('objects/Interviewer__c/fields/Employee__c.field-meta.xml', `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Employee__c</fullName>
    <deleteConstraint>SetNull</deleteConstraint>
    <label>Employee</label>
    <referenceTo>User</referenceTo>
    <relationshipLabel>Interviewers</relationshipLabel>
    <relationshipName>Interviewer_Users</relationshipName>
    <required>false</required>
    <trackTrending>false</trackTrending>
    <type>Lookup</type>
</CustomField>`);

// 4. Email Folder & Templates
writeFile('email/Position_Request_Responses-meta.xml', `<?xml version="1.0" encoding="UTF-8"?>
<EmailFolder xmlns="http://soap.sforce.com/2006/04/metadata">
    <accessType>Public</accessType>
    <name>Position Request Responses</name>
    <publicFolderAccess>ReadWrite</publicFolderAccess>
</EmailFolder>`);

writeFile('email/Position_Request_Responses/Position_Approved.email-meta.xml', `<?xml version="1.0" encoding="UTF-8"?>
<EmailTemplate xmlns="http://soap.sforce.com/2006/04/metadata">
    <available>true</available>
    <encodingKey>UTF-8</encodingKey>
    <name>Position Approved</name>
    <style>none</style>
    <subject>Your position request was approved</subject>
    <type>text</type>
    <uiType>Aloha</uiType>
</EmailTemplate>`);

writeFile('email/Position_Request_Responses/Position_Approved.email', `Dear {!Position__c.OwnerFirstName}, Good news! Your recent position request has been approved. Please log in to your org for details.`);

writeFile('email/Position_Request_Responses/Position_Rejected.email-meta.xml', `<?xml version="1.0" encoding="UTF-8"?>
<EmailTemplate xmlns="http://soap.sforce.com/2006/04/metadata">
    <available>true</available>
    <encodingKey>UTF-8</encodingKey>
    <name>Position Rejected</name>
    <style>none</style>
    <subject>Your position request was rejected</subject>
    <type>text</type>
    <uiType>Aloha</uiType>
</EmailTemplate>`);

writeFile('email/Position_Request_Responses/Position_Rejected.email', `Dear {!Position__c.OwnerFirstName}, Unfortunately, your recent position request has been rejected. Please log in to your org for details.`);

// 5. Workflows on Position__c (Field Updates & Email Alerts for Approval Process)
writeFile('workflows/Position__c.workflow-meta.xml', `<?xml version="1.0" encoding="UTF-8"?>
<Workflow xmlns="http://soap.sforce.com/2006/04/metadata">
    <alerts>
        <fullName>Email_position_owner_about_approval</fullName>
        <description>Email position owner about approval</description>
        <protected>false</protected>
        <recipients>
            <type>owner</type>
        </recipients>
        <senderType>CurrentUser</senderType>
        <template>Position_Request_Responses/Position_Approved</template>
    </alerts>
    <alerts>
        <fullName>Email_position_owner_about_rejection</fullName>
        <description>Email position owner about rejection</description>
        <protected>false</protected>
        <recipients>
            <type>owner</type>
        </recipients>
        <senderType>CurrentUser</senderType>
        <template>Position_Request_Responses/Position_Rejected</template>
    </alerts>
    <fieldUpdates>
        <fullName>Approval_Status_to_Pending</fullName>
        <field>Approval_Status__c</field>
        <literalValue>Pending</literalValue>
        <name>Approval Status to Pending</name>
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
        <fullName>Status_to_Open</fullName>
        <field>Status__c</field>
        <literalValue>Open</literalValue>
        <name>Status to Open</name>
        <notifyAssignee>false</notifyAssignee>
        <operation>Literal</operation>
        <protected>false</protected>
        <reevaluateOnChange>false</reevaluateOnChange>
    </fieldUpdates>
    <fieldUpdates>
        <fullName>Approval_Status_to_Rejected</fullName>
        <field>Approval_Status__c</field>
        <literalValue>Not Approved</literalValue>
        <name>Approval Status to Rejected</name>
        <notifyAssignee>false</notifyAssignee>
        <operation>Literal</operation>
        <protected>false</protected>
        <reevaluateOnChange>false</reevaluateOnChange>
    </fieldUpdates>
    <fieldUpdates>
        <fullName>Status_to_Closed</fullName>
        <field>Status__c</field>
        <literalValue>Closed</literalValue>
        <name>Status to Closed</name>
        <notifyAssignee>false</notifyAssignee>
        <operation>Literal</operation>
        <protected>false</protected>
        <reevaluateOnChange>false</reevaluateOnChange>
    </fieldUpdates>
    <fieldUpdates>
        <fullName>Approval_Status_to_Recalled</fullName>
        <field>Approval_Status__c</field>
        <literalValue>Recalled</literalValue>
        <name>Approval Status to Recalled</name>
        <notifyAssignee>false</notifyAssignee>
        <operation>Literal</operation>
        <protected>false</protected>
        <reevaluateOnChange>false</reevaluateOnChange>
    </fieldUpdates>
</Workflow>`);

// 6. Approval Process on Position__c
writeFile('approvalProcesses/Position__c.New_Position_Approval.approvalProcess-meta.xml', `<?xml version="1.0" encoding="UTF-8"?>
<ApprovalProcess xmlns="http://soap.sforce.com/2006/04/metadata">
    <active>true</active>
    <allowRecall>true</allowRecall>
    <allowedSubmitters>
        <type>owner</type>
    </allowedSubmitters>
    <approvalPageFields>
        <field>Department__c</field>
        <field>Education__c</field>
        <field>Job_Description__c</field>
        <field>Location__c</field>
        <field>Pay_Grade__c</field>
        <field>Salary_Range__c</field>
        <field>Skills_Required__c</field>
    </approvalPageFields>
    <approvalStep>
        <allowDelegate>false</allowDelegate>
        <assignedApprover>
            <approver>
                <type>userHierarchyField</type>
            </approver>
        </assignedApprover>
        <label>Manager of Position Owner</label>
        <name>Manager_of_Position_Owner</name>
    </approvalStep>
    <approvalStep>
        <allowDelegate>false</allowDelegate>
        <assignedApprover>
            <approver>
                <name>Approver_1__c</name>
                <type>relatedUserField</type>
            </approver>
            <whenMultipleApprovers>FirstResponse</whenMultipleApprovers>
        </assignedApprover>
        <label>Position Approver 1</label>
        <name>Position_Approver_1</name>
        <rejectBehavior>
            <type>RejectRequest</type>
        </rejectBehavior>
    </approvalStep>
    <approvalStep>
        <allowDelegate>false</allowDelegate>
        <assignedApprover>
            <approver>
                <name>Approver_2__c</name>
                <type>relatedUserField</type>
            </approver>
            <whenMultipleApprovers>FirstResponse</whenMultipleApprovers>
        </assignedApprover>
        <label>Position Approver 2</label>
        <name>Position_Approver_2</name>
        <rejectBehavior>
            <type>RejectRequest</type>
        </rejectBehavior>
    </approvalStep>
    <approvalStep>
        <allowDelegate>false</allowDelegate>
        <assignedApprover>
            <approver>
                <name>Approver_3__c</name>
                <type>relatedUserField</type>
            </approver>
            <whenMultipleApprovers>FirstResponse</whenMultipleApprovers>
        </assignedApprover>
        <entryCriteria>
            <criteriaItems>
                <field>Position__c.Salary_Range__c</field>
                <operation>equals</operation>
                <value>90K-120K, 120K+</value>
            </criteriaItems>
        </entryCriteria>
        <label>Position Approver 3</label>
        <name>Position_Approver_3</name>
        <rejectBehavior>
            <type>RejectRequest</type>
        </rejectBehavior>
    </approvalStep>
    <description>All positions must be approved by the recruiter&apos;s manager and two to three other approvers. These approvers are tracked in approver fields on the Position object.</description>
    <emailTemplate>Position_Request_Responses/Position_Approved</emailTemplate>
    <enableMobileDeviceAccess>false</enableMobileDeviceAccess>
    <finalApprovalActions>
        <action>
            <name>Approval_Status_to_Approved</name>
            <type>FieldUpdate</type>
        </action>
        <action>
            <name>Email_position_owner_about_approval</name>
            <type>Alert</type>
        </action>
        <action>
            <name>Status_to_Open</name>
            <type>FieldUpdate</type>
        </action>
    </finalApprovalActions>
    <finalApprovalRecordLock>false</finalApprovalRecordLock>
    <finalRejectionActions>
        <action>
            <name>Approval_Status_to_Rejected</name>
            <type>FieldUpdate</type>
        </action>
        <action>
            <name>Email_position_owner_about_rejection</name>
            <type>Alert</type>
        </action>
        <action>
            <name>Status_to_Closed</name>
            <type>FieldUpdate</type>
        </action>
    </finalRejectionActions>
    <finalRejectionRecordLock>false</finalRejectionRecordLock>
    <initialSubmissionActions>
        <action>
            <name>Approval_Status_to_Pending</name>
            <type>FieldUpdate</type>
        </action>
    </initialSubmissionActions>
    <label>New Position Approval</label>
    <nextAutomatedApprover>
        <useApproverFieldOfRecordOwner>true</useApproverFieldOfRecordOwner>
        <userHierarchyField>Manager</userHierarchyField>
    </nextAutomatedApprover>
    <recallActions>
        <action>
            <name>Approval_Status_to_Recalled</name>
            <type>FieldUpdate</type>
        </action>
    </recallActions>
    <recordEditability>AdminOrCurrentApprover</recordEditability>
    <showApprovalHistory>true</showApprovalHistory>
</ApprovalProcess>`);

// 7. Flow 1: Create Interviewer Record
writeFile('flows/Create_Interviewer_Record.flow-meta.xml', `<?xml version="1.0" encoding="UTF-8"?>
<Flow xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>61.0</apiVersion>
    <environments>Default</environments>
    <interviewLabel>Create Interviewer Record {!$Flow.CurrentDateTime}</interviewLabel>
    <label>Create Interviewer Record</label>
    <processMetadataValues>
        <name>BuilderType</name>
        <value>
            <stringValue>LightningFlowBuilder</stringValue>
        </value>
    </processMetadataValues>
    <processMetadataValues>
        <name>CanvasMode</name>
        <value>
            <stringValue>AUTO_LAYOUT_CANVAS</stringValue>
        </value>
    </processMetadataValues>
    <processType>AutoLaunchedFlow</processType>
    <recordCreates>
        <name>Create_Interviewer_Record</name>
        <label>Create Interviewer Record</label>
        <locationX>176</locationX>
        <locationY>323</locationY>
        <inputAssignments>
            <field>Employee__c</field>
            <value>
                <elementReference>$Record.Hiring_Manager__c</elementReference>
            </value>
        </inputAssignments>
        <inputAssignments>
            <field>Position__c</field>
            <value>
                <elementReference>$Record.Id</elementReference>
            </value>
        </inputAssignments>
        <object>Interviewer__c</object>
    </recordCreates>
    <start>
        <locationX>50</locationX>
        <locationY>0</locationY>
        <connector>
            <targetReference>Create_Interviewer_Record</targetReference>
        </connector>
        <filterLogic>and</filterLogic>
        <filters>
            <field>Hiring_Manager__c</field>
            <operator>IsNull</operator>
            <value>
                <booleanValue>false</booleanValue>
            </value>
        </filters>
        <object>Position__c</object>
        <recordTriggerType>Create</recordTriggerType>
        <triggerType>RecordAfterSave</triggerType>
    </start>
    <status>Active</status>
</Flow>`);

// 8. Flow 2: Submit New Positions for Approval
writeFile('flows/Submit_New_Positions_for_Approval.flow-meta.xml', `<?xml version="1.0" encoding="UTF-8"?>
<Flow xmlns="http://soap.sforce.com/2006/04/metadata">
    <actionCalls>
        <name>Submit_Position_for_Approval</name>
        <label>Submit Position for Approval</label>
        <locationX>176</locationX>
        <locationY>323</locationY>
        <actionName>submit</actionName>
        <actionType>submit</actionType>
        <flowTransactionModel>CurrentTransaction</flowTransactionModel>
        <inputParameters>
            <name>objectId</name>
            <value>
                <elementReference>$Record.Id</elementReference>
            </value>
        </inputParameters>
        <inputParameters>
            <name>processDefinitionNameOrId</name>
            <value>
                <stringValue>New_Position_Approval</stringValue>
            </value>
        </inputParameters>
        <nameSegment>submit</nameSegment>
        <versionSegment>1</versionSegment>
    </actionCalls>
    <apiVersion>61.0</apiVersion>
    <environments>Default</environments>
    <interviewLabel>Submit New Positions for Approval {!$Flow.CurrentDateTime}</interviewLabel>
    <label>Submit New Positions for Approval</label>
    <processMetadataValues>
        <name>BuilderType</name>
        <value>
            <stringValue>LightningFlowBuilder</stringValue>
        </value>
    </processMetadataValues>
    <processMetadataValues>
        <name>CanvasMode</name>
        <value>
            <stringValue>AUTO_LAYOUT_CANVAS</stringValue>
        </value>
    </processMetadataValues>
    <processType>AutoLaunchedFlow</processType>
    <start>
        <locationX>50</locationX>
        <locationY>0</locationY>
        <connector>
            <targetReference>Submit_Position_for_Approval</targetReference>
        </connector>
        <doesRequireRecordChangedToMeetCriteria>true</doesRequireRecordChangedToMeetCriteria>
        <filterLogic>and</filterLogic>
        <filters>
            <field>Status__c</field>
            <operator>EqualTo</operator>
            <value>
                <stringValue>New</stringValue>
            </value>
        </filters>
        <filters>
            <field>Job_Description__c</field>
            <operator>IsNull</operator>
            <value>
                <booleanValue>false</booleanValue>
            </value>
        </filters>
        <filters>
            <field>Department__c</field>
            <operator>IsNull</operator>
            <value>
                <booleanValue>false</booleanValue>
            </value>
        </filters>
        <filters>
            <field>Education__c</field>
            <operator>IsNull</operator>
            <value>
                <booleanValue>false</booleanValue>
            </value>
        </filters>
        <filters>
            <field>Hiring_Manager__c</field>
            <operator>IsNull</operator>
            <value>
                <booleanValue>false</booleanValue>
            </value>
        </filters>
        <object>Position__c</object>
        <recordTriggerType>CreateAndUpdate</recordTriggerType>
        <triggerType>RecordAfterSave</triggerType>
    </start>
    <status>Active</status>
</Flow>`);

// 9. Flow 3: New Review (Screen Flow)
writeFile('flows/New_Review.flow-meta.xml', `<?xml version="1.0" encoding="UTF-8"?>
<Flow xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>61.0</apiVersion>
    <choices>
        <name>Average</name>
        <choiceText>Average</choiceText>
        <dataType>Number</dataType>
        <value>
            <numberValue>3.0</numberValue>
        </value>
    </choices>
    <choices>
        <name>BelowAverage</name>
        <choiceText>Below Average</choiceText>
        <dataType>Number</dataType>
        <value>
            <numberValue>2.0</numberValue>
        </value>
    </choices>
    <choices>
        <name>Excellent</name>
        <choiceText>Excellent</choiceText>
        <dataType>Number</dataType>
        <value>
            <numberValue>5.0</numberValue>
        </value>
    </choices>
    <choices>
        <name>Poor</name>
        <choiceText>Poor</choiceText>
        <dataType>Number</dataType>
        <value>
            <numberValue>1.0</numberValue>
        </value>
    </choices>
    <choices>
        <name>VeryGood</name>
        <choiceText>Very Good</choiceText>
        <dataType>Number</dataType>
        <value>
            <numberValue>4.0</numberValue>
        </value>
    </choices>
    <environments>Default</environments>
    <interviewLabel>New Review {!$Flow.CurrentDateTime}</interviewLabel>
    <label>New Review</label>
    <processMetadataValues>
        <name>BuilderType</name>
        <value>
            <stringValue>LightningFlowBuilder</stringValue>
        </value>
    </processMetadataValues>
    <processMetadataValues>
        <name>CanvasMode</name>
        <value>
            <stringValue>FREE_FORM_CANVAS</stringValue>
        </value>
    </processMetadataValues>
    <processType>Flow</processType>
    <recordCreates>
        <name>createReview</name>
        <label>createReview</label>
        <locationX>300</locationX>
        <locationY>200</locationY>
        <connector>
            <targetReference>Record_Created</targetReference>
        </connector>
        <faultConnector>
            <targetReference>Display_Faults</targetReference>
        </faultConnector>
        <inputAssignments>
            <field>Core_Competencies_Comments__c</field>
            <value>
                <elementReference>Core_Competencies_Comments</elementReference>
            </value>
        </inputAssignments>
        <inputAssignments>
            <field>Core_Competencies__c</field>
            <value>
                <elementReference>Core_Competencies</elementReference>
            </value>
        </inputAssignments>
        <inputAssignments>
            <field>Experience_Comments__c</field>
            <value>
                <elementReference>Experience_Comments</elementReference>
            </value>
        </inputAssignments>
        <inputAssignments>
            <field>Experience__c</field>
            <value>
                <elementReference>Experience</elementReference>
            </value>
        </inputAssignments>
        <inputAssignments>
            <field>Job_Application__c</field>
            <value>
                <elementReference>varJobAppId</elementReference>
            </value>
        </inputAssignments>
        <inputAssignments>
            <field>Leadership_Skills_Comments__c</field>
            <value>
                <elementReference>Leadership_Skills_Comments</elementReference>
            </value>
        </inputAssignments>
        <inputAssignments>
            <field>Leadership_Skills__c</field>
            <value>
                <elementReference>Leadership_Skills</elementReference>
            </value>
        </inputAssignments>
        <inputAssignments>
            <field>Reason_Recommended__c</field>
            <value>
                <elementReference>Reason_Recommended</elementReference>
            </value>
        </inputAssignments>
        <inputAssignments>
            <field>Recommend_for_Hire__c</field>
            <value>
                <elementReference>Recommend_for_Hire</elementReference>
            </value>
        </inputAssignments>
        <object>Review__c</object>
    </recordCreates>
    <screens>
        <name>Display_Faults</name>
        <label>Display Faults</label>
        <locationX>450</locationX>
        <locationY>350</locationY>
        <allowBack>true</allowBack>
        <allowFinish>true</allowFinish>
        <allowPause>true</allowPause>
        <fields>
            <name>Display_Fault_Message</name>
            <fieldText>&lt;p&gt;{!$Flow.FaultMessage}&lt;/p&gt;</fieldText>
            <fieldType>DisplayText</fieldType>
        </fields>
        <showFooter>true</showFooter>
        <showHeader>true</showHeader>
    </screens>
    <screens>
        <name>New_Review</name>
        <label>New Review</label>
        <locationX>150</locationX>
        <locationY>200</locationY>
        <allowBack>true</allowBack>
        <allowFinish>true</allowFinish>
        <allowPause>true</allowPause>
        <connector>
            <targetReference>createReview</targetReference>
        </connector>
        <fields>
            <name>Experience</name>
            <choiceReferences>Excellent</choiceReferences>
            <choiceReferences>VeryGood</choiceReferences>
            <choiceReferences>Average</choiceReferences>
            <choiceReferences>BelowAverage</choiceReferences>
            <choiceReferences>Poor</choiceReferences>
            <dataType>Number</dataType>
            <fieldText>Experience</fieldText>
            <fieldType>RadioButtons</fieldType>
            <isRequired>false</isRequired>
            <scale>0</scale>
        </fields>
        <fields>
            <name>Experience_Comments</name>
            <dataType>String</dataType>
            <fieldText>Experience Comments</fieldText>
            <fieldType>InputField</fieldType>
            <isRequired>false</isRequired>
        </fields>
        <fields>
            <name>Leadership_Skills</name>
            <choiceReferences>Excellent</choiceReferences>
            <choiceReferences>VeryGood</choiceReferences>
            <choiceReferences>Average</choiceReferences>
            <choiceReferences>BelowAverage</choiceReferences>
            <choiceReferences>Poor</choiceReferences>
            <dataType>Number</dataType>
            <fieldText>Leadership Skills</fieldText>
            <fieldType>RadioButtons</fieldType>
            <isRequired>false</isRequired>
            <scale>0</scale>
        </fields>
        <fields>
            <name>Leadership_Skills_Comments</name>
            <dataType>String</dataType>
            <fieldText>Leadership Skills Comments</fieldText>
            <fieldType>InputField</fieldType>
            <isRequired>false</isRequired>
        </fields>
        <fields>
            <name>Core_Competencies</name>
            <choiceReferences>Excellent</choiceReferences>
            <choiceReferences>VeryGood</choiceReferences>
            <choiceReferences>Average</choiceReferences>
            <choiceReferences>BelowAverage</choiceReferences>
            <choiceReferences>Poor</choiceReferences>
            <dataType>Number</dataType>
            <fieldText>Core Competencies</fieldText>
            <fieldType>RadioButtons</fieldType>
            <isRequired>false</isRequired>
            <scale>0</scale>
        </fields>
        <fields>
            <name>Core_Competencies_Comments</name>
            <dataType>String</dataType>
            <fieldText>Core Competencies Comments</fieldText>
            <fieldType>InputField</fieldType>
            <isRequired>false</isRequired>
        </fields>
        <fields>
            <name>Recommend_for_Hire</name>
            <dataType>Boolean</dataType>
            <fieldText>Recommend for Hire</fieldText>
            <fieldType>InputField</fieldType>
            <isRequired>true</isRequired>
        </fields>
        <fields>
            <name>Reason_Recommended</name>
            <dataType>String</dataType>
            <fieldText>Reason Recommended</fieldText>
            <fieldType>InputField</fieldType>
            <isRequired>false</isRequired>
        </fields>
        <showFooter>true</showFooter>
        <showHeader>true</showHeader>
    </screens>
    <screens>
        <name>Record_Created</name>
        <label>Record Created</label>
        <locationX>450</locationX>
        <locationY>200</locationY>
        <allowBack>true</allowBack>
        <allowFinish>true</allowFinish>
        <allowPause>true</allowPause>
        <fields>
            <name>RecordCreated</name>
            <fieldText>&lt;p&gt;Your review record has been created successfully.&lt;/p&gt;</fieldText>
            <fieldType>DisplayText</fieldType>
        </fields>
        <showFooter>true</showFooter>
        <showHeader>true</showHeader>
    </screens>
    <start>
        <locationX>50</locationX>
        <locationY>50</locationY>
        <connector>
            <targetReference>New_Review</targetReference>
        </connector>
    </start>
    <status>Active</status>
    <variables>
        <name>varJobAppId</name>
        <dataType>String</dataType>
        <isCollection>false</isCollection>
        <isInput>true</isInput>
        <isOutput>true</isOutput>
    </variables>
</Flow>`);

// 10. WebLink on Job_Application__c
writeFile('objects/Job_Application__c/webLinks/New_Review.webLink-meta.xml', `<?xml version="1.0" encoding="UTF-8"?>
<WebLink xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>New_Review</fullName>
    <availability>online</availability>
    <displayType>button</displayType>
    <encodingKey>UTF-8</encodingKey>
    <linkType>url</linkType>
    <masterLabel>New Review</masterLabel>
    <openType>replace</openType>
    <protected>false</protected>
    <url>/flow/New_Review?varJobAppId={!Job_Application__c.Id}&amp;retURL=/{!Job_Application__c.Id}</url>
</WebLink>`);

// 11. Update Job_Application__c-Job Application Layout.layout-meta.xml
const jobAppLayoutPath = path.join(BASE_DIR, 'layouts', 'Job_Application__c-Job Application Layout.layout-meta.xml');
if (fs.existsSync(jobAppLayoutPath)) {
  let layoutContent = fs.readFileSync(jobAppLayoutPath, 'utf8');
  if (!layoutContent.includes('<customButtons>New_Review</customButtons>')) {
    layoutContent = layoutContent.replace('<layoutSections>', '<customButtons>New_Review</customButtons>\n    <layoutSections>');
    fs.writeFileSync(jobAppLayoutPath, layoutContent, 'utf8');
    console.log('[UPDATED] Job_Application__c-Job Application Layout.layout-meta.xml with New_Review button');
  }
}

// 12. Update Position__c-Position Layout.layout-meta.xml with relatedList Interviewers
const posLayoutPath = path.join(BASE_DIR, 'layouts', 'Position__c-Position Layout.layout-meta.xml');
if (fs.existsSync(posLayoutPath)) {
  let posLayoutContent = fs.readFileSync(posLayoutPath, 'utf8');
  if (!posLayoutContent.includes('Interviewer__c.Position__c')) {
    posLayoutContent = posLayoutContent.replace('</Layout>', `    <relatedLists>
        <fields>NAME</fields>
        <fields>Employee__c</fields>
        <relatedList>Interviewer__c.Position__c</relatedList>
    </relatedLists>
</Layout>`);
    fs.writeFileSync(posLayoutPath, posLayoutContent, 'utf8');
    console.log('[UPDATED] Position__c-Position Layout.layout-meta.xml with Interviewers relatedList');
  }
}

// 13. Update Technical_Position_Page.flexipage-meta.xml with Approvers section
const techPosPagePath = path.join(BASE_DIR, 'flexipages', 'Technical_Position_Page.flexipage-meta.xml');
if (fs.existsSync(techPosPagePath)) {
  let flexi = fs.readFileSync(techPosPagePath, 'utf8');
  if (!flexi.includes('Approver_1__c')) {
    // Add Approvers facets and section
    const approverFacets = `    <flexiPageRegions>
        <itemInstances>
            <fieldInstance>
                <fieldInstanceProperties>
                    <name>uiBehavior</name>
                    <value>none</value>
                </fieldInstanceProperties>
                <fieldItem>Record.Approver_1__c</fieldItem>
                <identifier>Record_Approver_1__c</identifier>
            </fieldInstance>
        </itemInstances>
        <itemInstances>
            <fieldInstance>
                <fieldInstanceProperties>
                    <name>uiBehavior</name>
                    <value>none</value>
                </fieldInstanceProperties>
                <fieldItem>Record.Approver_2__c</fieldItem>
                <identifier>Record_Approver_2__c</identifier>
            </fieldInstance>
        </itemInstances>
        <itemInstances>
            <fieldInstance>
                <fieldInstanceProperties>
                    <name>uiBehavior</name>
                    <value>none</value>
                </fieldInstanceProperties>
                <fieldItem>Record.Approver_3__c</fieldItem>
                <identifier>Record_Approver_3__c</identifier>
            </fieldInstance>
        </itemInstances>
        <name>Col1_Approvers</name>
        <type>Facet</type>
    </flexiPageRegions>
    <flexiPageRegions>
        <itemInstances>
            <componentInstance>
                <componentInstanceProperties>
                    <name>body</name>
                    <value>Col1_Approvers</value>
                </componentInstanceProperties>
                <componentName>flexipage:column</componentName>
                <identifier>col_Approvers</identifier>
            </componentInstance>
        </itemInstances>
        <name>SecCols_Approvers</name>
        <type>Facet</type>
    </flexiPageRegions>`;

    const approverSection = `        <itemInstances>
            <componentInstance>
                <componentInstanceProperties>
                    <name>columns</name>
                    <value>SecCols_Approvers</value>
                </componentInstanceProperties>
                <componentInstanceProperties>
                    <name>horizontalAlignment</name>
                    <value>false</value>
                </componentInstanceProperties>
                <componentInstanceProperties>
                    <name>label</name>
                    <value>Approvers</value>
                </componentInstanceProperties>
                <componentName>flexipage:fieldSection</componentName>
                <identifier>sec_Approvers</identifier>
            </componentInstance>
        </itemInstances>`;

    // Insert facets before detailTabContent
    flexi = flexi.replace('<name>detailTabContent</name>', `${approverFacets}\n    <name>detailTabContent</name>`);
    // Insert section into detailTabContent before </flexiPageRegions>
    flexi = flexi.replace('<name>detailTabContent</name>\n        <type>Facet</type>', `${approverSection}\n        <name>detailTabContent</name>\n        <type>Facet</type>`);
    fs.writeFileSync(techPosPagePath, flexi, 'utf8');
    console.log('[UPDATED] Technical_Position_Page.flexipage-meta.xml with Approvers section');
  }
}

console.log('\nAll Project 16 metadata files written successfully!');
