List<PermissionSet> psets = [SELECT Id, Name, Profile.Name, IsCustom FROM PermissionSet WHERE IsOwnedByProfile = true];
List<FieldPermissions> fpsToInsert = new List<FieldPermissions>();
Set<Id> existingPsetIds = new Set<Id>();
for (FieldPermissions fp : [SELECT ParentId FROM FieldPermissions WHERE Field = 'Program__c.Type__c']) {
    existingPsetIds.add(fp.ParentId);
}
for (PermissionSet ps : psets) {
    if (!existingPsetIds.contains(ps.Id)) {
        fpsToInsert.add(new FieldPermissions(
            ParentId = ps.Id,
            SobjectType = 'Program__c',
            Field = 'Program__c.Type__c',
            PermissionsRead = true,
            PermissionsEdit = true
        ));
    }
}
Database.SaveResult[] results = Database.insert(fpsToInsert, false);
Integer successCount = 0;
for (Database.SaveResult sr : results) {
    if (sr.isSuccess()) {
        successCount++;
    } else {
        // some standard profiles might not allow FLS insert, which is expected
    }
}
System.debug('Inserted FLS for ' + successCount + ' profiles out of ' + fpsToInsert.size());

// Also assign Kathy Cooper to the Recruiter role
List<User> kathyList = [SELECT Id, UserRoleId FROM User WHERE Name = 'Kathy Cooper' LIMIT 1];
List<UserRole> recruiterRole = [SELECT Id FROM UserRole WHERE DeveloperName = 'Recruiter' LIMIT 1];
if (!kathyList.isEmpty() && !recruiterRole.isEmpty()) {
    kathyList[0].UserRoleId = recruiterRole[0].Id;
    update kathyList[0];
    System.debug('Assigned Kathy Cooper to Recruiter role');
}
