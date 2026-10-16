// 1. Check/create Kathy Cooper
List<User> existing = [SELECT Id, Username FROM User WHERE Name = 'Kathy Cooper' LIMIT 1];
User kathy;
if (existing.isEmpty()) {
    Profile p = [SELECT Id FROM Profile WHERE Name = 'Standard Platform User' LIMIT 1];
    List<UserRole> roles = [SELECT Id FROM UserRole WHERE Name = 'Customer Support, North America' LIMIT 1];
    Id roleId = roles.isEmpty() ? null : roles[0].Id;
    
    kathy = new User(
        FirstName = 'Kathy',
        LastName = 'Cooper',
        Email = 'gaurav.22310804@curious-moose-vbdewg.com',
        Username = 'kcooper.recruiting.' + System.currentTimeMillis() + '@curious-moose-vbdewg.com',
        Alias = 'kcoop',
        CommunityNickname = 'kcoop_' + System.currentTimeMillis(),
        Title = 'Customer Support Manager',
        ProfileId = p.Id,
        UserRoleId = roleId,
        TimeZoneSidKey = 'America/Los_Angeles',
        LocaleSidKey = 'en_US',
        EmailEncodingKey = 'UTF-8',
        LanguageLocaleKey = 'en_US',
        IsActive = true
    );
    insert kathy;
    System.debug('Created Kathy Cooper: ' + kathy.Id);
} else {
    kathy = existing[0];
    System.debug('Kathy Cooper already exists: ' + kathy.Id);
}

// 2. Assign Kathy Cooper as Manager to running user
User currentUser = [SELECT Id, ManagerId FROM User WHERE Id = :UserInfo.getUserId()];
currentUser.ManagerId = kathy.Id;
update currentUser;
System.debug('Updated current user Manager to Kathy Cooper');

// 3. Create test Position record
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

// 4. Ensure Interviewer record exists for pos and Kathy
List<Interviewer__c> existingInt = [SELECT Id FROM Interviewer__c WHERE Position__c = :pos.Id AND Employee__c = :kathy.Id];
if (existingInt.isEmpty()) {
    Interviewer__c interviewer = new Interviewer__c(
        Position__c = pos.Id,
        Employee__c = kathy.Id
    );
    insert interviewer;
    System.debug('Created Interviewer record manually: ' + interviewer.Id);
} else {
    System.debug('Interviewer record already exists: ' + existingInt[0].Id);
}
