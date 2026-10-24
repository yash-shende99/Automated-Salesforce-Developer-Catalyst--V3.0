const { execSync } = require('child_process');
const fs = require('fs');

const apex = `
List<PermissionSet> psList = [SELECT Id, Profile.Name FROM PermissionSet WHERE Profile.Name IN ('System Administrator', 'Standard User')];
List<String> fields = new List<String>{'Opportunity.Approval_Status__c', 'Opportunity.Discount_Percentage__c'};

for (PermissionSet ps : psList) {
    Set<String> existing = new Set<String>();
    for (FieldPermissions fp : [SELECT Field FROM FieldPermissions WHERE ParentId = :ps.Id AND Field IN :fields]) {
        existing.add(fp.Field);
    }
    List<FieldPermissions> newFp = new List<FieldPermissions>();
    for (String f : fields) {
        if (!existing.contains(f)) {
            newFp.add(new FieldPermissions(
                ParentId = ps.Id,
                SobjectType = 'Opportunity',
                Field = f,
                PermissionsRead = true,
                PermissionsEdit = true
            ));
        }
    }
    if (!newFp.isEmpty()) insert newFp;
}
System.debug('FLS granted for Opportunity fields');
`;

fs.writeFileSync('scripts/temp_opp_fls.apex', apex);
try {
  const out = execSync('sf apex run --file scripts/temp_opp_fls.apex --target-org friend_org').toString();
  console.log(out);
} finally {
  if (fs.existsSync('scripts/temp_opp_fls.apex')) fs.unlinkSync('scripts/temp_opp_fls.apex');
}
