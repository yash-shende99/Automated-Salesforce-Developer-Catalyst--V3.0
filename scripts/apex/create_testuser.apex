Profile p = [SELECT Id FROM Profile WHERE Name = 'Minimum Access - Salesforce' LIMIT 1];
List<User> existing = [SELECT Id, IsActive, ProfileId FROM User WHERE Alias = 'testuser' OR Username LIKE '%testuser%' LIMIT 1];
if (!existing.isEmpty()) {
    existing[0].IsActive = false;
    existing[0].ProfileId = p.Id;
    update existing;
    System.debug('Updated existing testuser: ' + existing[0].Id);
} else {
    String orgId = UserInfo.getOrganizationId();
    User u = new User(
        FirstName = 'Test',
        LastName = 'User',
        Alias = 'testuser',
        Email = 'testuser@example.com',
        Username = 'testuser.' + Math.abs(Crypto.getRandomInteger()) + '@catalyst.' + orgId + '.test',
        ProfileId = p.Id,
        TimeZoneSidKey = 'America/Los_Angeles',
        LocaleSidKey = 'en_US',
        EmailEncodingKey = 'UTF-8',
        LanguageLocaleKey = 'en_US',
        IsActive = false
    );
    insert u;
    System.debug('Created inactive testuser: ' + u.Id);
}
