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
