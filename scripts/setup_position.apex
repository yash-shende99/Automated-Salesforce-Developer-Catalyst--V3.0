User kathy = [SELECT Id FROM User WHERE Name = 'Kathy Cooper' LIMIT 1];

RecordType rt = [SELECT Id FROM RecordType WHERE SobjectType = 'Position__c' AND DeveloperName = 'Nontechnical_Position' LIMIT 1];

List<Position__c> existingPos = [SELECT Id FROM Position__c WHERE Name = 'Super Support Supervisor'];
delete existingPos;

Position__c pos = new Position__c(
    Name = 'Super Support Supervisor',
    RecordTypeId = rt.Id,
    Status__c = 'New',
    Department__c = 'Support',
    Location__c = 'US',
    Hiring_Manager__c = kathy.Id,
    Job_Description__c = 'Manage a team that fields inquiries and cases from customers',
    Pay_Grade__c = 'S-200'
);
insert pos;
System.debug('Created test Position record: ' + pos.Id);

List<Interviewer__c> existingInt = [SELECT Id FROM Interviewer__c WHERE Position__c = :pos.Id AND Employee__c = :kathy.Id];
if (existingInt.isEmpty()) {
    Interviewer__c interviewer = new Interviewer__c(
        Position__c = pos.Id,
        Employee__c = kathy.Id
    );
    insert interviewer;
    System.debug('Created Interviewer record: ' + interviewer.Id);
} else {
    System.debug('Interviewer record already exists: ' + existingInt[0].Id);
}
