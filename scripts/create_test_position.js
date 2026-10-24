const { execSync } = require('child_process');
const fs = require('fs');

const apex = `
RecordType rt = [SELECT Id FROM RecordType WHERE SObjectType = 'Position__c' AND DeveloperName = 'Nontechnical_Position' LIMIT 1];
User kathy = [SELECT Id FROM User WHERE Name = 'Kathy Cooper' LIMIT 1];

// Delete any existing test record to have a clean trigger execution
delete [SELECT Id FROM Position__c WHERE Name = 'Super Support Supervisor'];

Position__c p = new Position__c(
    Name = 'Super Support Supervisor',
    RecordTypeId = rt.Id,
    Status__c = 'New',
    Department__c = 'Support',
    Location__c = 'US',
    Hiring_Manager__c = kathy.Id,
    Job_Description__c = 'Manage a team that fields inquiries and cases from customers',
    Pay_Grade__c = 'S-200'
);
insert p;
System.debug('Inserted Position: ' + p.Id);

// Check if flow triggered and created Interviewer__c record
List<Interviewer__c> interviewers = [SELECT Id, Name, Employee__c, Position__c FROM Interviewer__c WHERE Position__c = :p.Id];
System.debug('Interviewers created by flow: ' + interviewers.size());
for (Interviewer__c i : interviewers) {
    System.debug('Interviewer: ' + i.Id + ' Employee: ' + i.Employee__c);
}
`;

fs.writeFileSync('scripts/temp_create_position.apex', apex);
try {
  const out = execSync('sf apex run --file scripts/temp_create_position.apex --target-org trailhead').toString();
  console.log(out);
} finally {
  if (fs.existsSync('scripts/temp_create_position.apex')) {
    fs.unlinkSync('scripts/temp_create_position.apex');
  }
}
