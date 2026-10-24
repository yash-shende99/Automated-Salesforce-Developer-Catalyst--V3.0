const { execSync } = require('child_process');
const fs = require('fs');

const apex = `
PermissionSet adminPs = [SELECT Id FROM PermissionSet WHERE Profile.Name = 'System Administrator' LIMIT 1];

// 1. Grant ObjectPermissions on Interviewer__c if not present
List<ObjectPermissions> objPerms = [SELECT Id FROM ObjectPermissions WHERE ParentId = :adminPs.Id AND SobjectType = 'Interviewer__c'];
if (objPerms.isEmpty()) {
    insert new ObjectPermissions(
        ParentId = adminPs.Id,
        SobjectType = 'Interviewer__c',
        PermissionsCreate = true,
        PermissionsRead = true,
        PermissionsEdit = true,
        PermissionsDelete = true,
        PermissionsViewAllRecords = true,
        PermissionsModifyAllRecords = true
    );
    System.debug('Granted ObjectPermissions for Interviewer__c');
}

// 2. Grant FieldPermissions
List<String> fields = new List<String>{
    'Position__c.Status__c',
    'Position__c.Approval_Status__c',
    'Position__c.Job_Description__c',
    'Position__c.Skills_Required__c',
    'Position__c.Education__c',
    'Position__c.Salary_Range__c',
    'Position__c.Pay_Grade__c',
    'Position__c.Location__c',
    'Position__c.Approver_1__c',
    'Position__c.Approver_2__c',
    'Position__c.Approver_3__c',
    'Review__c.Core_Competencies_Comments__c',
    'Review__c.Experience_Comments__c',
    'Review__c.Leadership_Skills_Comments__c',
    'Interviewer__c.Employee__c'
};

// Check existing field perms
Set<String> existingFields = new Set<String>();
for (FieldPermissions fp : [SELECT Field FROM FieldPermissions WHERE ParentId = :adminPs.Id AND Field IN :fields]) {
    existingFields.add(fp.Field);
}

List<FieldPermissions> newFp = new List<FieldPermissions>();
for (String f : fields) {
    if (!existingFields.contains(f)) {
        String sobj = f.split('\\\\.')[0];
        newFp.add(new FieldPermissions(
            ParentId = adminPs.Id,
            SobjectType = sobj,
            Field = f,
            PermissionsRead = true,
            PermissionsEdit = true
        ));
    }
}

if (!newFp.isEmpty()) {
    insert newFp;
    System.debug('Granted ' + newFp.size() + ' FieldPermissions');
} else {
    System.debug('All field permissions already present');
}
`;

fs.writeFileSync('scripts/temp_grant_fls.apex', apex);
try {
  const out = execSync('sf apex run --file scripts/temp_grant_fls.apex --target-org friend_org').toString();
  console.log(out);
} finally {
  if (fs.existsSync('scripts/temp_grant_fls.apex')) {
    fs.unlinkSync('scripts/temp_grant_fls.apex');
  }
}
