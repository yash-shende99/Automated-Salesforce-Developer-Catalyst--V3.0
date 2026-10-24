const { execSync } = require('child_process');
const fs = require('fs');

const apex = `
List<PermissionSet> psList = [SELECT Id, Profile.Name FROM PermissionSet WHERE Profile.Name = 'System Administrator'];
String fieldName = 'Account.Number_of_Contacts__c';

for (PermissionSet ps : psList) {
    List<FieldPermissions> existing = [SELECT Id FROM FieldPermissions WHERE ParentId = :ps.Id AND Field = :fieldName];
    if (existing.isEmpty()) {
        insert new FieldPermissions(
            ParentId = ps.Id,
            SobjectType = 'Account',
            Field = fieldName,
            PermissionsRead = true,
            PermissionsEdit = true
        );
    }
}
System.debug('FLS granted for Account.Match_Billing_Address__c');
`;

fs.writeFileSync('scripts/temp_fls.apex', apex);
try {
  const out = execSync('sf apex run --file scripts/temp_fls.apex --target-org trailhead').toString();
  console.log(out);
} finally {
  if (fs.existsSync('scripts/temp_fls.apex')) fs.unlinkSync('scripts/temp_fls.apex');
}
