Program__c p = new Program__c(Name = 'Test Campus Outreach', Type__c = 'Campus Outreach');
insert p;

User kathy = [SELECT Id, Name, UserRole.DeveloperName, Profile.Name FROM User WHERE Name = 'Kathy Cooper' LIMIT 1];

UserRecordAccess access = [SELECT RecordId, HasReadAccess, HasEditAccess FROM UserRecordAccess WHERE UserId = :kathy.Id AND RecordId = :p.Id];
System.debug('Kathy Access on Program: HasReadAccess=' + access.HasReadAccess + ', HasEditAccess=' + access.HasEditAccess);

delete p;
