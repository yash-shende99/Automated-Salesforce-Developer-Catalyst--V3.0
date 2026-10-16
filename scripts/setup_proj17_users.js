const { execSync } = require('child_process');
const fs = require('fs');

const apex = `
// 1. Role: Manager under VP, North American Sales
UserRole vpRole = [SELECT Id FROM UserRole WHERE DeveloperName = 'VPNorthAmericanSales' LIMIT 1];
List<UserRole> existingRoles = [SELECT Id, DeveloperName FROM UserRole WHERE DeveloperName = 'Manager'];
UserRole mgrRole;
if (existingRoles.isEmpty()) {
    mgrRole = new UserRole(
        Name = 'Manager',
        DeveloperName = 'Manager',
        ParentRoleId = vpRole.Id
    );
    insert mgrRole;
    System.debug('Created Role Manager: ' + mgrRole.Id);
} else {
    mgrRole = existingRoles[0];
    System.debug('Manager role already exists: ' + mgrRole.Id);
}

// 2. Profile: Standard Platform User
Profile platformProfile = [SELECT Id FROM Profile WHERE Name = 'Standard Platform User' LIMIT 1];

// 3. User: Allison Wheeler
List<User> existingAllison = [SELECT Id, Username FROM User WHERE Name = 'Allison Wheeler'];
User allison;
if (existingAllison.isEmpty()) {
    allison = new User(
        FirstName = 'Allison',
        LastName = 'Wheeler',
        Email = 'catalyst.dev@example.com',
        Username = 'awheeler.discount.' + System.currentTimeMillis() + '@creative-badger-i5mqnc.com',
        Alias = 'awheel',
        CommunityNickname = 'awheel_' + System.currentTimeMillis(),
        Title = 'Vice President North American Sales',
        CompanyName = 'AW Computing',
        Department = 'Sales',
        ProfileId = platformProfile.Id,
        UserRoleId = vpRole.Id,
        TimeZoneSidKey = 'America/Los_Angeles',
        LocaleSidKey = 'en_US',
        EmailEncodingKey = 'UTF-8',
        LanguageLocaleKey = 'en_US',
        IsActive = true
    );
    insert allison;
    System.debug('Created Allison Wheeler: ' + allison.Username);
} else {
    allison = existingAllison[0];
    System.debug('Allison Wheeler already exists: ' + allison.Username);
}

// 4. User: Courtney Brown
List<User> existingCourtney = [SELECT Id, Username FROM User WHERE Name = 'Courtney Brown'];
User courtney;
if (existingCourtney.isEmpty()) {
    courtney = new User(
        FirstName = 'Courtney',
        LastName = 'Brown',
        Email = 'catalyst.dev@example.com',
        Username = 'cbrown.discount.' + System.currentTimeMillis() + '@creative-badger-i5mqnc.com',
        Alias = 'cbrow',
        CommunityNickname = 'cbrow_' + System.currentTimeMillis(),
        Title = 'Manager',
        CompanyName = 'AW Computing',
        Department = 'Sales',
        ProfileId = platformProfile.Id,
        UserRoleId = mgrRole.Id,
        TimeZoneSidKey = 'America/Los_Angeles',
        LocaleSidKey = 'en_US',
        EmailEncodingKey = 'UTF-8',
        LanguageLocaleKey = 'en_US',
        IsActive = true
    );
    insert courtney;
    System.debug('Created Courtney Brown: ' + courtney.Username);
} else {
    courtney = existingCourtney[0];
    System.debug('Courtney Brown already exists: ' + courtney.Username);
}

// 5. Update running user Manager to Courtney Brown
User currentUser = [SELECT Id, ManagerId FROM User WHERE Id = :UserInfo.getUserId()];
currentUser.ManagerId = courtney.Id;
update currentUser;
System.debug('Set running user Manager to Courtney Brown: ' + courtney.Id);

// Save Allison username to a file for building metadata
`;

fs.writeFileSync('scripts/temp_setup_users.apex', apex);
try {
  const out = execSync('sf apex run --file scripts/temp_setup_users.apex --target-org trailhead').toString();
  console.log(out);
} finally {
  if (fs.existsSync('scripts/temp_setup_users.apex')) {
    fs.unlinkSync('scripts/temp_setup_users.apex');
  }
}
