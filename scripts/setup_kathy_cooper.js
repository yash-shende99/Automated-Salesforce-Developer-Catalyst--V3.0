const { execSync } = require('child_process');

// Script to create Kathy Cooper user and assign as manager to current user
const apexCode = `
// 1. Check if Kathy Cooper exists
List<User> existing = [SELECT Id, Username FROM User WHERE Name = 'Kathy Cooper' LIMIT 1];
User kathy;
if (existing.isEmpty()) {
    Profile p = [SELECT Id FROM Profile WHERE Name = 'Standard Platform User' LIMIT 1];
    UserRole r = [SELECT Id FROM UserRole WHERE Name = 'Customer Support, North America' LIMIT 1];
    
    kathy = new User(
        FirstName = 'Kathy',
        LastName = 'Cooper',
        Email = 'catalyst.dev@example.com',
        Username = 'kcooper.recruiting.' + System.currentTimeMillis() + '@creative-badger-i5mqnc.com',
        Alias = 'kcoop',
        CommunityNickname = 'kcoop_' + System.currentTimeMillis(),
        Title = 'Customer Support Manager',
        ProfileId = p.Id,
        UserRoleId = r.Id,
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

// 2. Assign Kathy Cooper as Manager to current running user
User currentUser = [SELECT Id, ManagerId FROM User WHERE Id = :UserInfo.getUserId()];
currentUser.ManagerId = kathy.Id;
update currentUser;
System.debug('Updated current user ' + currentUser.Id + ' Manager to Kathy Cooper: ' + kathy.Id);
`;

console.log('Executing Apex to configure Kathy Cooper user & Manager...');
const fs = require('fs');
fs.writeFileSync('scripts/temp_kathy.apex', apexCode);

try {
  const out = execSync('sf apex run --file scripts/temp_kathy.apex --target-org trailhead').toString();
  console.log(out);
} catch (e) {
  console.error('Apex execution failed:', e.stdout ? e.stdout.toString() : e.message);
} finally {
  if (fs.existsSync('scripts/temp_kathy.apex')) {
    fs.unlinkSync('scripts/temp_kathy.apex');
  }
}
